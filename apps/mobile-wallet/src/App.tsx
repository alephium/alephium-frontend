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
  PRICES_REFRESH_INTERVAL,
  selectDoVerifiedFungibleTokensNeedInitialization,
  syncTokenCurrentPrices,
  syncTokenPriceHistories,
  syncUnknownTokensInfo,
  syncVerifiedFungibleTokens,
  TRANSACTIONS_REFRESH_INTERVAL
} from '@alephium/shared'
import { useInitializeClient, useInterval } from '@alephium/shared-react'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { difference, union } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import ToastAnchor from '~/components/toasts/ToastAnchor'
import { useLocalization } from '~/features/localization/useLocalization'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import useLoadStoredSettings from '~/hooks/useLoadStoredSettings'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import {
  getStoredWalletMetadataWithoutThrowingError,
  validateAndRepareStoredWalletData
} from '~/persistent-storage/wallet'
import AnimatedCirclesBackground from '~/screens/Dashboard/AnimatedCirclesBackground'
import {
  makeSelectAddressesUnknownTokens,
  selectAllAddressVerifiedFungibleTokenSymbols,
  syncLatestTransactions
} from '~/store/addressesSlice'
import { store } from '~/store/store'
import { selectTransactionUnknownTokenIds } from '~/store/transactions/transactionSelectors'
import { appLaunchedWithLastUsedWallet } from '~/store/wallet/walletActions'
import { metadataRestored } from '~/store/wallet/walletSlice'
import { themes } from '~/style/themes'

const App = () => {
  const { showAppContent, wasMetadataRestored } = useShowAppContentAfterValidatingStoredWalletData()
  const [theme, setTheme] = useState<DefaultTheme>(themes.light)

  useEffect(
    () =>
      store.subscribe(() => {
        const currentTheme = themes[store.getState().settings.theme]
        setTheme(currentTheme)
        if (Platform.OS === 'android') {
          NavigationBar.setBackgroundColorAsync(
            currentTheme.name === 'light' ? currentTheme.bg.highlight : currentTheme.bg.back2
          )
        }
      }),
    []
  )

  return (
    <Provider store={store}>
      <Main>
        <ThemeProvider theme={theme}>
          <StatusBar animated translucent style="light" />
          {showAppContent ? (
            <RootStackNavigation
              initialRouteName={wasMetadataRestored ? 'ImportWalletAddressDiscoveryScreen' : undefined}
            />
          ) : (
            // Using hideAsync from expo-splash-screen creates issues in iOS. To mitigate this, we replicate the default
            // splash screen to be show after the default one gets hidden, before we can show app content.
            <AnimatedCirclesBackground isLoading={true} />
          )}
          <ToastAnchor />
        </ThemeProvider>
      </Main>
    </Provider>
  )
}

const useShowAppContentAfterValidatingStoredWalletData = () => {
  const [state, setState] = useState({ showAppContent: false, wasMetadataRestored: false })

  const onUserConfirm = useCallback((userChoseYes: boolean) => {
    setState({ showAppContent: true, wasMetadataRestored: userChoseYes })
    store.dispatch(metadataRestored())
  }, [])

  const { data: validationStatus } = useAsyncData(
    useCallback(() => validateAndRepareStoredWalletData(onUserConfirm), [onUserConfirm])
  )

  useEffect(() => {
    if (validationStatus === 'valid') setState({ showAppContent: true, wasMetadataRestored: false })
  }, [validationStatus])

  return state
}

const Main = ({ children, ...props }: ViewProps) => {
  const dispatch = useAppDispatch()
  const network = useAppSelector((s) => s.network)
  const isLoadingVerifiedFungibleTokens = useAppSelector((s) => s.fungibleTokens.loadingVerified)
  const isLoadingTokenTypes = useAppSelector((s) => s.fungibleTokens.loadingTokenTypes)
  const isLoadingLatestTxs = useAppSelector((s) => s.loaders.loadingLatestTransactions)
  const nbOfAddresses = useAppSelector((s) => s.addresses.ids.length)
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const verifiedFungibleTokensNeedInitialization = useAppSelector(selectDoVerifiedFungibleTokensNeedInitialization)
  const verifiedFungibleTokenSymbols = useAppSelector(selectAllAddressVerifiedFungibleTokenSymbols)
  const settings = useAppSelector((s) => s.settings)
  const appJustLaunched = useAppSelector((s) => s.app.wasJustLaunched)
  const { data: walletMetadata } = useAsyncData(getStoredWalletMetadataWithoutThrowingError)

  const selectAddressesUnknownTokens = useMemo(makeSelectAddressesUnknownTokens, [])
  const addressUnknownTokenIds = useAppSelector(selectAddressesUnknownTokens)
  const txUnknownTokenIds = useAppSelector(selectTransactionUnknownTokenIds)
  const checkedUnknownTokenIds = useAppSelector((s) => s.app.checkedUnknownTokenIds)
  const newUnknownTokens = difference(union(addressUnknownTokenIds, txUnknownTokenIds), checkedUnknownTokenIds)

  useLoadStoredSettings()
  useInitializeClient()
  useLocalization()

  useEffect(() => {
    if (walletMetadata) dispatch(appLaunchedWithLastUsedWallet(walletMetadata))
  }, [dispatch, walletMetadata])

  useEffect(() => {
    if (
      network.status === 'online' &&
      !verifiedFungibleTokensNeedInitialization &&
      !isLoadingTokenTypes &&
      newUnknownTokens.length > 0
    ) {
      dispatch(syncUnknownTokensInfo(newUnknownTokens))
    }
  }, [dispatch, isLoadingTokenTypes, network.status, newUnknownTokens, verifiedFungibleTokensNeedInitialization])

  // Fetch verified tokens from GitHub token-list and sync current and historical prices for each verified fungible
  // token found in each address
  useEffect(() => {
    if (network.status === 'online' && !isLoadingVerifiedFungibleTokens) {
      if (verifiedFungibleTokensNeedInitialization) {
        dispatch(syncVerifiedFungibleTokens())
      } else if (verifiedFungibleTokenSymbols.uninitialized.length > 0) {
        const symbols = verifiedFungibleTokenSymbols.uninitialized

        dispatch(syncTokenCurrentPrices({ verifiedFungibleTokenSymbols: symbols, currency: settings.currency }))
        dispatch(syncTokenPriceHistories({ verifiedFungibleTokenSymbols: symbols, currency: settings.currency }))
      }
    }
  }, [
    dispatch,
    isLoadingVerifiedFungibleTokens,
    network.status,
    settings.currency,
    verifiedFungibleTokenSymbols.uninitialized,
    verifiedFungibleTokensNeedInitialization
  ])

  const refreshTokensLatestPrice = useCallback(() => {
    dispatch(
      syncTokenCurrentPrices({
        verifiedFungibleTokenSymbols: verifiedFungibleTokenSymbols.withPriceHistory,
        currency: settings.currency
      })
    )
  }, [dispatch, settings.currency, verifiedFungibleTokenSymbols.withPriceHistory])

  useInterval(
    refreshTokensLatestPrice,
    PRICES_REFRESH_INTERVAL,
    network.status !== 'online' || verifiedFungibleTokenSymbols.withPriceHistory.length === 0
  )

  const checkForNewTransactions = useCallback(() => {
    dispatch(syncLatestTransactions({ addresses: 'all', areAddressesNew: false }))
  }, [dispatch])

  const dataResyncNeeded =
    nbOfAddresses > 0 && network.status === 'online' && !isLoadingLatestTxs && (isUnlocked || appJustLaunched)

  useEffect(() => {
    if (addressesStatus === 'uninitialized' && dataResyncNeeded) checkForNewTransactions()
  }, [addressesStatus, checkForNewTransactions, dataResyncNeeded])

  useInterval(
    checkForNewTransactions,
    TRANSACTIONS_REFRESH_INTERVAL,
    !dataResyncNeeded || addressesStatus === 'uninitialized'
  )

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      {children}
    </SafeAreaProvider>
  )
}

export default App
