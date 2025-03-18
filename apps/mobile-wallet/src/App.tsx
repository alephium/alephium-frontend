import {
  FREQUENT_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL,
  PRICES_REFRESH_INTERVAL,
  selectDoVerifiedFungibleTokensNeedInitialization,
  syncTokenCurrentPrices,
  syncUnknownTokensInfo,
  syncVerifiedFungibleTokens
} from '@alephium/shared'
import { queryClient, useInitializeClient, useInterval } from '@alephium/shared-react'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { difference, union } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, View, ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import ToastAnchor from '~/components/toasts/ToastAnchor'
import LoadingManager from '~/features/loader/LoadingManager'
import { useLocalization } from '~/features/localization/useLocalization'
import { useSystemRegion } from '~/features/settings/regionSettings/useSystemRegion'
import useLoadStoredSettings from '~/features/settings/useLoadStoredSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import {
  getStoredWalletMetadataWithoutThrowingError,
  validateAndRepareStoredWalletData
} from '~/persistent-storage/wallet'
import { syncLatestTransactions } from '~/store/addresses/addressesActions'
import {
  makeSelectAddressesUnknownTokensIds,
  selectAllAddressVerifiedFungibleTokenSymbols
} from '~/store/addresses/addressesSelectors'
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

  useReactQueryDevTools(queryClient)

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
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
              <View style={{ flex: 1, alignItems: 'center' }}>
                <AlephiumLogo style={{ width: '15%' }} />
              </View>
            )}
            <ToastAnchor />
            <LoadingManager />
          </ThemeProvider>
        </Main>
      </QueryClientProvider>
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
  const addressesListedFungibleTokensSymbols = useRef<Array<string>>([])
  const currency = useRef(settings.currency)

  const selectAddressesUnknownTokens = useMemo(() => makeSelectAddressesUnknownTokensIds(), [])
  const addressUnknownTokenIds = useAppSelector(selectAddressesUnknownTokens)
  const txUnknownTokenIds = useAppSelector(selectTransactionUnknownTokenIds)
  const checkedUnknownTokenIds = useAppSelector((s) => s.app.checkedUnknownTokenIds)
  const newUnknownTokens = difference(union(addressUnknownTokenIds, txUnknownTokenIds), checkedUnknownTokenIds)

  useLoadStoredSettings()
  useInitializeClient()
  useLocalization()
  useSystemRegion()

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

  // Fetch verified tokens from GitHub token-list
  useEffect(() => {
    if (network.status === 'online' && !isLoadingVerifiedFungibleTokens) {
      if (verifiedFungibleTokensNeedInitialization) {
        dispatch(syncVerifiedFungibleTokens())
      }
    }
  }, [dispatch, isLoadingVerifiedFungibleTokens, network.status, verifiedFungibleTokensNeedInitialization])

  useEffect(() => {
    if (
      verifiedFungibleTokenSymbols.some((symbol) => !addressesListedFungibleTokensSymbols.current.includes(symbol)) ||
      currency.current !== settings.currency
    ) {
      dispatch(
        syncTokenCurrentPrices({
          verifiedFungibleTokenSymbols,
          currency: settings.currency
        })
      )

      addressesListedFungibleTokensSymbols.current = verifiedFungibleTokenSymbols
      currency.current = settings.currency
    }
  }, [dispatch, settings.currency, verifiedFungibleTokenSymbols])

  const refreshTokensLatestPrice = useCallback(() => {
    dispatch(syncTokenCurrentPrices({ verifiedFungibleTokenSymbols, currency: settings.currency }))
  }, [dispatch, settings.currency, verifiedFungibleTokenSymbols])

  useInterval(refreshTokensLatestPrice, PRICES_REFRESH_INTERVAL, network.status !== 'online')

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
    FREQUENT_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL,
    !dataResyncNeeded || addressesStatus === 'uninitialized'
  )

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      {children}
    </SafeAreaProvider>
  )
}

export default App
