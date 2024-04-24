/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import {
  AddressHash,
  localStorageNetworkSettingsMigrated,
  syncTokenCurrentPrices,
  syncTokenPriceHistories,
  useGetTokenList
} from '@alephium/shared'
import { useInitializeClient, useInterval } from '@alephium/shared-react'
import { AnimatePresence } from 'framer-motion'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import AnnouncementBanner from '@/components/AnnouncementBanner'
import AppSpinner from '@/components/AppSpinner'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SnackbarManager from '@/components/SnackbarManager'
import SplashScreen from '@/components/SplashScreen'
import UpdateWalletBanner from '@/components/UpdateWalletBanner'
import { useGlobalContext } from '@/contexts/global'
import { WalletConnectContextProvider } from '@/contexts/walletconnect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import UpdateWalletModal from '@/modals/UpdateWalletModal'
import Router from '@/routes'
import { syncAddressesAlphHistoricBalances, syncAddressesData } from '@/storage/addresses/addressesActions'
import { selectAddressIds } from '@/storage/addresses/addressesSelectors'
import { devModeShortcutDetected, localStorageDataMigrationFailed } from '@/storage/global/globalActions'
import {
  localStorageGeneralSettingsMigrated,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded
} from '@/storage/settings/settingsActions'
import { pendingTransactionsStorage } from '@/storage/transactions/pendingTransactionsPersistentStorage'
import { makeSelectAddressesHashesWithPendingTransactions } from '@/storage/transactions/transactionsSelectors'
import { restorePendingTransactions } from '@/storage/transactions/transactionsStorageUtils'
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { AlephiumWindow } from '@/types/window'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'
import { languageOptions } from '@/utils/settings'

const App = () => {
  const { newVersion, newVersionDownloadTriggered } = useGlobalContext()
  const dispatch = useAppDispatch()
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const selectAddressesHashesWithPendingTransactions = useMemo(makeSelectAddressesHashesWithPendingTransactions, [])
  const addressesWithPendingTxs = useAppSelector(selectAddressesHashesWithPendingTransactions)
  const networkProxy = useAppSelector((s) => s.network.settings.proxy)
  const networkStatus = useAppSelector((s) => s.network.status)
  const networkName = useAppSelector((s) => s.network.name)
  const theme = useAppSelector((s) => s.global.theme)
  const loading = useAppSelector((s) => s.global.loading)
  const settings = useAppSelector((s) => s.settings)
  const wallets = useAppSelector((s) => s.global.wallets)
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const showDevIndication = useDevModeShortcut()
  const posthog = usePostHog()

  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isSyncingAddressData = useAppSelector((s) => s.addresses.syncingAddressData)

  const { data: tokenList } = useGetTokenList(networkName)
  const tokenListSymbols = tokenList?.tokens.map((token) => token.symbol)

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [isUpdateWalletModalVisible, setUpdateWalletModalVisible] = useState(!!newVersion)

  const _window = window as unknown as AlephiumWindow
  const electron = _window.electron

  useInitializeClient()

  useEffect(() => {
    try {
      const generalSettings = migrateGeneralSettings()
      const networkSettings = migrateNetworkSettings()
      migrateWalletData()

      dispatch(localStorageGeneralSettingsMigrated(generalSettings))
      dispatch(localStorageNetworkSettingsMigrated(networkSettings))
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Local storage data migration failed' })
      dispatch(localStorageDataMigrationFailed())
    }
  }, [dispatch, posthog])

  useEffect(() => {
    if (posthog.__loaded)
      posthog.people.set({
        desktop_wallet_version: import.meta.env.VITE_VERSION,
        wallets: wallets.length,
        theme: settings.theme,
        devTools: settings.devTools,
        lockTimeInMs: settings.walletLockTimeInMinutes,
        language: settings.language,
        passwordRequirement: settings.passwordRequirement,
        fiatCurrency: settings.fiatCurrency,
        network: networkName
      })
  }, [
    networkName,
    posthog.__loaded,
    posthog.people,
    settings.devTools,
    settings.fiatCurrency,
    settings.language,
    settings.passwordRequirement,
    settings.theme,
    settings.walletLockTimeInMinutes,
    wallets.length
  ])

  const setSystemLanguage = useCallback(async () => {
    const systemLanguage = await electron?.app.getSystemLanguage()

    if (!systemLanguage) {
      dispatch(systemLanguageMatchFailed())
      return
    }

    const systemLanguageCode = systemLanguage.substring(0, 2)
    const matchedLanguage = languageOptions.find((lang) => lang.value.startsWith(systemLanguageCode))

    if (matchedLanguage) {
      dispatch(systemLanguageMatchSucceeded(matchedLanguage.value))
    } else {
      dispatch(systemLanguageMatchFailed())
    }
  }, [dispatch, electron?.app])

  useEffect(() => {
    if (settings.language === undefined) setSystemLanguage()
  }, [settings.language, setSystemLanguage])

  useEffect(() => {
    if (networkProxy) electron?.app.setProxySettings(networkProxy)
  }, [electron?.app, networkProxy])

  useEffect(() => {
    if (networkStatus === 'online') {
      if (addressesStatus === 'uninitialized') {
        if (!isSyncingAddressData && addressHashes.length > 0 && activeWalletId) {
          const storedPendingTxs = pendingTransactionsStorage.load(activeWalletId)

          dispatch(syncAddressesData())
            .unwrap()
            .then((results) => {
              const mempoolTxHashes = results.flatMap((result) => result.mempoolTransactions.map((tx) => tx.hash))

              restorePendingTransactions(activeWalletId, mempoolTxHashes, storedPendingTxs)
            })

          dispatch(syncAddressesAlphHistoricBalances())
        }
      }
    }
  }, [addressHashes.length, addressesStatus, dispatch, isSyncingAddressData, networkStatus, activeWalletId])

  // Sync current and historical prices for each verified fungible
  // token found in each address
  useEffect(() => {
    if (networkStatus === 'online' && tokenListSymbols) {
      dispatch(
        syncTokenCurrentPrices({ verifiedFungibleTokenSymbols: tokenListSymbols, currency: settings.fiatCurrency })
      )
      dispatch(
        syncTokenPriceHistories({ verifiedFungibleTokenSymbols: tokenListSymbols, currency: settings.fiatCurrency })
      )
    }
  }, [])

  const refreshAddressesData = useCallback(() => {
    dispatch(syncAddressesData(addressesWithPendingTxs))
  }, [dispatch, addressesWithPendingTxs])

  useInterval(refreshAddressesData, 5000, addressesWithPendingTxs.length === 0 || isSyncingAddressData)

  useEffect(() => {
    if (newVersion) setUpdateWalletModalVisible(true)
  }, [newVersion])

  useEffect(() => {
    if (newVersionDownloadTriggered) setUpdateWalletModalVisible(true)
  }, [newVersionDownloadTriggered])

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}

      <WalletConnectContextProvider>
        <AppContainer showDevIndication={showDevIndication}>
          <CenteredSection>
            <Router />
          </CenteredSection>
          <BannerSection>{newVersion && <UpdateWalletBanner />}</BannerSection>
          <AnnouncementBanner />
        </AppContainer>
      </WalletConnectContextProvider>

      <SnackbarManager />
      {loading && <AppSpinner />}
      <AnimatePresence>
        {isUpdateWalletModalVisible && <UpdateWalletModal onClose={() => setUpdateWalletModalVisible(false)} />}
      </AnimatePresence>
    </ThemeProvider>
  )
}

export default App

const AppContainer = styled.div<{ showDevIndication: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  background-color: ${({ theme }) => theme.bg.secondary};

  ${({ showDevIndication, theme }) =>
    showDevIndication &&
    css`
      border: 5px solid ${theme.global.valid};
    `};
`

const BannerSection = styled.div`
  flex-shrink: 0;
`

const useDevModeShortcut = () => {
  const dispatch = useAppDispatch()
  const devMode = useAppSelector((s) => s.global.devMode)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const handleKeyPress = (event: KeyboardEvent) => {
      const isCommandDShortcutPressed = event.metaKey === true && event.key === 'd' // Cmd + d (for dev)

      if (!isCommandDShortcutPressed) return

      dispatch(devModeShortcutDetected({ activate: !devMode }))
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [devMode, dispatch])

  return devMode
}
