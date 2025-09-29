import { appLaunchedWithLastUsedWallet } from '@alephium/shared'
import {
  ApiContextProvider,
  PersistQueryClientContextProvider,
  queryClient,
  useAddressesDataPolling,
  useInitializeThrottledClient,
  usePersistQueryClientContext
} from '@alephium/shared-react'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, InteractionManager, Platform, View, ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import ToastAnchor from '~/components/toasts/ToastAnchor'
import LoadingManager from '~/features/loader/LoadingManager'
import { useLocalization } from '~/features/localization/useLocalization'
import usePersistQueryCacheOnBackground from '~/features/persistQueryCache/usePersistQueryCacheOnBackground'
import { useSystemRegion } from '~/features/settings/regionSettings/useSystemRegion'
import useLoadStoredSettings from '~/features/settings/useLoadStoredSettings'
import { useAppDispatch } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { hasMigratedFromAsyncStorage, migrateFromAsyncStorage } from '~/persistent-storage/storage'
import { createTanstackAsyncStoragePersister } from '~/persistent-storage/tanstackAsyncStoragePersister'
import {
  getStoredWalletMetadataWithoutThrowingError,
  validateAndRepareStoredWalletData
} from '~/persistent-storage/wallet'
import { store } from '~/store/store'
import { metadataRestored } from '~/store/wallet/walletSlice'
import { themes } from '~/style/themes'

// TODO: Delete after everyone has migrated to MMKV
const App = () => {
  const [hasMigrated, setHasMigrated] = useState(hasMigratedFromAsyncStorage)

  useEffect(() => {
    if (!hasMigratedFromAsyncStorage) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          await migrateFromAsyncStorage()
        } catch (e) {
          sendAnalytics({
            type: 'error',
            message: 'Failed to migrate from AsyncStorage to MMKV',
            error: e
          })
        }

        setHasMigrated(true)
      })
    }
  }, [])

  if (!hasMigrated) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return <AppContent />
}

const AppContent = () => {
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
        <Main>
          <ThemeProvider theme={theme}>
            <StatusBar animated translucent style="light" />

            <AppRoutes />

            <ToastAnchor />
            <LoadingManager />
          </ThemeProvider>
        </Main>
      </PersistQueryClientContextProvider>
    </Provider>
  )
}

const AppRoutes = () => {
  const { showAppContent, wasMetadataRestored } = useShowAppContentAfterValidatingStoredWalletData()
  const isQueryCacheRestored = useIsQueryCacheRestored()

  const showSplashScreen = !showAppContent || !isQueryCacheRestored

  if (showSplashScreen) {
    return (
      // Using hideAsync from expo-splash-screen creates issues in iOS. To mitigate this, we replicate the default
      // splash screen to be show after the default one gets hidden, before we can show app content.
      <View style={{ flex: 1, alignItems: 'center' }}>
        <AlephiumLogo style={{ width: '15%' }} />
      </View>
    )
  }

  return <Routes initialRouteName={wasMetadataRestored ? 'ImportWalletAddressDiscoveryScreen' : undefined} />
}

const Routes = ({ initialRouteName }: { initialRouteName: keyof RootStackParamList | undefined }) => {
  useAddressesDataPolling()

  return (
    <ApiContextProvider>
      <RootStackNavigation initialRouteName={initialRouteName} />
    </ApiContextProvider>
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

const useIsQueryCacheRestored = () => {
  const dispatch = useAppDispatch()
  const { data: walletMetadata } = useAsyncData(getStoredWalletMetadataWithoutThrowingError)
  const { restoreQueryCache } = usePersistQueryClientContext()

  const [isQueryCacheRestored, setIsQueryCacheRestored] = useState(false)

  useEffect(() => {
    if (walletMetadata === undefined) {
      return
    } else if (walletMetadata === null) {
      setIsQueryCacheRestored(true)
    } else {
      dispatch(appLaunchedWithLastUsedWallet(walletMetadata))
      restoreQueryCache(walletMetadata.id)
        .then(() => {
          setIsQueryCacheRestored(true)
        })
        .catch(() => {
          setIsQueryCacheRestored(true)
        })
    }
  }, [dispatch, restoreQueryCache, walletMetadata])

  return isQueryCacheRestored
}

const Main = ({ children, ...props }: ViewProps) => {
  useLoadStoredSettings()
  useInitializeThrottledClient()
  useLocalization()
  useSystemRegion()
  usePersistQueryCacheOnBackground()

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      {children}
    </SafeAreaProvider>
  )
}

export default App
