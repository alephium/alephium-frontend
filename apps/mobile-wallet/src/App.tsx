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
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, InteractionManager, Platform, View, ViewProps } from 'react-native'
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
import { runMultiWalletMigrationIfNeeded } from '~/persistent-storage/migrations/multiWalletMigration'
import { hasMigratedFromAsyncStorage, migrateFromAsyncStorage } from '~/persistent-storage/storage'
import { createTanstackAsyncStoragePersister } from '~/persistent-storage/tanstackAsyncStoragePersister'
import { getStoredWalletMetadataWithoutThrowingError } from '~/persistent-storage/wallet'
import { validateAndRepairStoredWalletData } from '~/persistent-storage/walletValidation'
import { store } from '~/store/store'
import { metadataRestored } from '~/store/wallet/walletSlice'
import { themes } from '~/style/themes'
import { showToast } from '~/utils/layout'

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
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { data: validationResult } = useAsyncData(
    useCallback(async () => {
      await runMultiWalletMigrationIfNeeded()

      return validateAndRepairStoredWalletData()
    }, [])
  )

  useEffect(() => {
    if (!validationResult) return

    if (validationResult.status === 'valid') {
      if (validationResult.warning) {
        sendAnalytics({ type: 'error', message: validationResult.warning })
      }
      setState({ showAppContent: true, wasMetadataRestored: false })
    } else if (validationResult.status === 'invalid') {
      showToast({
        text1: t('Could not unlock app'),
        text2: t(
          validationResult.error === 'Could not find mnemonic for existing wallet metadata'
            ? 'Missing encrypted mnemonic'
            : 'Wallet metadata not found'
        ),
        type: 'error',
        autoHide: false
      })
      sendAnalytics({ type: 'error', message: validationResult.error })
    } else if (validationResult.status === 'needs-restore') {
      Alert.alert(
        t('Restore data'),
        t(
          validationResult.appWasUninstalled
            ? 'We noticed that you deleted the app, would you like to restore your last wallet?'
            : "Due to an unexpected error some of your app's data are missing. Would you like to regenerate them? Your funds are safe."
        ),
        [
          {
            text: t('No'),
            onPress: () => setState({ showAppContent: true, wasMetadataRestored: false })
          },
          {
            text: t('Yes'),
            onPress: async () => {
              const success = await validationResult.restoreWallet()

              if (success) {
                showToast({ text1: t('App data were reset'), type: 'success' })
                sendAnalytics({ event: 'Recreated missing wallet metadata for existing wallet' })
              } else {
                showToast({
                  text1: t('Could not unlock app'),
                  text2: t('Wallet metadata not found'),
                  type: 'error',
                  autoHide: false
                })
                sendAnalytics({
                  type: 'error',
                  message: 'Could not recreate missing wallet metadata for existing wallet'
                })
              }

              setState({ showAppContent: true, wasMetadataRestored: success })
              dispatch(metadataRestored())
            }
          }
        ]
      )
    }
  }, [dispatch, t, validationResult])

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
