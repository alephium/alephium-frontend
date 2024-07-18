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
  selectDoVerifiedFungibleTokensNeedInitialization,
  syncUnknownTokensInfo,
  syncVerifiedFungibleTokens
} from '@alephium/shared'
import { useInitializeClient, useInterval } from '@alephium/shared-react'
import { difference, union } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import { useAlphPrice } from '@/api/addressesFungibleTokensPricesDataHooks'
import AppSpinner from '@/components/AppSpinner'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SnackbarManager from '@/components/SnackbarManager'
import SplashScreen from '@/components/SplashScreen'
import { WalletConnectContextProvider } from '@/contexts/walletconnect'
import useAnalytics from '@/features/analytics/useAnalytics'
import AutoUpdateSnackbar from '@/features/autoUpdate/AutoUpdateSnackbar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAutoLock from '@/hooks/useAutoLock'
import Router from '@/routes'
import { syncAddressesData } from '@/storage/addresses/addressesActions'
import { makeSelectAddressesUnknownTokens, selectAddressIds } from '@/storage/addresses/addressesSelectors'
import {
  devModeShortcutDetected,
  localStorageDataMigrationFailed,
  osThemeChangeDetected
} from '@/storage/global/globalActions'
import {
  localStorageGeneralSettingsMigrated,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded
} from '@/storage/settings/settingsActions'
import { pendingTransactionsStorage } from '@/storage/transactions/pendingTransactionsPersistentStorage'
import {
  makeSelectAddressesHashesWithPendingTransactions,
  selectTransactionUnknownTokenIds
} from '@/storage/transactions/transactionsSelectors'
import { restorePendingTransactions } from '@/storage/transactions/transactionsStorageUtils'
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { AlephiumWindow } from '@/types/window'
import { currentVersion } from '@/utils/app-data'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'
import { languageOptions } from '@/utils/settings'

const App = () => {
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
  const { sendAnalytics } = useAnalytics()
  useAlphPrice() // TODO: Group with other prefetch queries in a usePrefetchData hook

  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isSyncingAddressData = useAppSelector((s) => s.addresses.syncingAddressData)
  const verifiedFungibleTokensNeedInitialization = useAppSelector(selectDoVerifiedFungibleTokensNeedInitialization)
  const isLoadingVerifiedFungibleTokens = useAppSelector((s) => s.fungibleTokens.loadingVerified)
  const isLoadingUnverifiedFungibleTokens = useAppSelector((s) => s.fungibleTokens.loadingUnverified)

  const selectAddressesUnknownTokens = useMemo(makeSelectAddressesUnknownTokens, [])
  const addressUnknownTokenIds = useAppSelector(selectAddressesUnknownTokens).map(({ id }) => id)
  const txUnknownTokenIds = useAppSelector(selectTransactionUnknownTokenIds)
  const checkedUnknownTokenIds = useAppSelector((s) => s.fungibleTokens.checkedUnknownTokenIds)
  const newUnknownTokens = difference(union(addressUnknownTokenIds, txUnknownTokenIds), checkedUnknownTokenIds)

  const [splashScreenVisible, setSplashScreenVisible] = useState(true)

  const _window = window as unknown as AlephiumWindow
  const electron = _window.electron

  useInitializeClient()
  useAutoLock()

  useEffect(() => {
    const shouldListenToOSThemeChanges = settings.theme === 'system'

    if (!shouldListenToOSThemeChanges) return

    const removeOSThemeChangeListener = electron?.theme.onShouldUseDarkColors((useDark: boolean) =>
      dispatch(osThemeChangeDetected(useDark ? 'dark' : 'light'))
    )

    const removeGetNativeThemeListener = electron?.theme.onGetNativeTheme((nativeTheme) =>
      dispatch(osThemeChangeDetected(nativeTheme.shouldUseDarkColors ? 'dark' : 'light'))
    )

    electron?.theme.getNativeTheme()

    return () => {
      removeGetNativeThemeListener && removeGetNativeThemeListener()
      removeOSThemeChangeListener && removeOSThemeChangeListener()
    }
  }, [dispatch, electron?.theme, settings.theme])

  useEffect(() => {
    try {
      const generalSettings = migrateGeneralSettings()
      const networkSettings = migrateNetworkSettings()
      migrateWalletData()

      dispatch(localStorageGeneralSettingsMigrated(generalSettings))
      dispatch(localStorageNetworkSettingsMigrated(networkSettings))
    } catch {
      sendAnalytics({ type: 'error', message: 'Local storage data migration failed' })
      dispatch(localStorageDataMigrationFailed())
    }
  }, [dispatch, sendAnalytics])

  useEffect(() => {
    if (posthog.__loaded)
      posthog.people.set({
        desktop_wallet_version: currentVersion,
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

          try {
            dispatch(syncAddressesData())
              .unwrap()
              .then((results) => {
                const mempoolTxHashes = results.flatMap((result) => result.mempoolTransactions.map((tx) => tx.hash))

                restorePendingTransactions(activeWalletId, mempoolTxHashes, storedPendingTxs)
              })
          } catch {
            sendAnalytics({ type: 'error', message: 'Could not sync address data automatically' })
          }
        }
      } else if (addressesStatus === 'initialized') {
        if (
          !verifiedFungibleTokensNeedInitialization &&
          !isLoadingUnverifiedFungibleTokens &&
          newUnknownTokens.length > 0
        ) {
          dispatch(syncUnknownTokensInfo(newUnknownTokens))
        }
      }
    }
  }, [
    addressHashes.length,
    addressesStatus,
    verifiedFungibleTokensNeedInitialization,
    dispatch,
    isLoadingUnverifiedFungibleTokens,
    isSyncingAddressData,
    networkStatus,
    newUnknownTokens,
    activeWalletId,
    sendAnalytics
  ])

  // Fetch verified tokens from GitHub token-list
  useEffect(() => {
    if (networkStatus === 'online' && !isLoadingVerifiedFungibleTokens) {
      if (verifiedFungibleTokensNeedInitialization) {
        dispatch(syncVerifiedFungibleTokens())
      }
    }
  }, [dispatch, isLoadingVerifiedFungibleTokens, networkStatus, verifiedFungibleTokensNeedInitialization])

  const refreshAddressesData = useCallback(() => {
    try {
      dispatch(syncAddressesData(addressesWithPendingTxs))
    } catch {
      sendAnalytics({ type: 'error', message: 'Could not sync address data when refreshing automatically' })
    }
  }, [dispatch, addressesWithPendingTxs, sendAnalytics])

  useInterval(refreshAddressesData, 5000, addressesWithPendingTxs.length === 0 || isSyncingAddressData)

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}

      <WalletConnectContextProvider>
        <AppContainer showDevIndication={showDevIndication}>
          <CenteredSection>
            <Router />
          </CenteredSection>
        </AppContainer>
      </WalletConnectContextProvider>

      <SnackbarManager />
      <AutoUpdateSnackbar />
      {loading && <AppSpinner />}
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
