import {
  ApiContextProvider,
  PersistQueryClientContextProvider,
  queryClient,
  useAddressesDataPolling,
  useInitializeClient,
  useInitializeThrottledClient,
  usePersistQueryClientContext
} from '@alephium/shared-react'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { Platform, View, ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import ToastAnchor from '~/components/toasts/ToastAnchor'
import LoadingManager from '~/features/loader/LoadingManager'
import { useLocalization } from '~/features/localization/useLocalization'
import { useSystemRegion } from '~/features/settings/regionSettings/useSystemRegion'
import useLoadStoredSettings from '~/features/settings/useLoadStoredSettings'
import { useAppDispatch } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import { createTanstackAsyncStoragePersister } from '~/persistent-storage/tanstackAsyncStoragePersister'
import {
  getStoredWalletMetadataWithoutThrowingError,
  validateAndRepareStoredWalletData
} from '~/persistent-storage/wallet'
import { store } from '~/store/store'
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
      <PersistQueryClientContextProvider createPersister={createTanstackAsyncStoragePersister}>
        <ApiContextProvider>
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
        </ApiContextProvider>
      </PersistQueryClientContextProvider>
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
  const { data: walletMetadata } = useAsyncData(getStoredWalletMetadataWithoutThrowingError)
  const { restoreQueryCache } = usePersistQueryClientContext()

  useLoadStoredSettings()
  useInitializeClient() // TODO: Delete
  useInitializeThrottledClient()
  useLocalization()
  useSystemRegion()
  useAddressesDataPolling()

  useEffect(() => {
    if (walletMetadata) {
      dispatch(appLaunchedWithLastUsedWallet(walletMetadata))
      restoreQueryCache(walletMetadata.id)
    }
  }, [dispatch, restoreQueryCache, walletMetadata])

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      {children}
    </SafeAreaProvider>
  )
}

export default App
