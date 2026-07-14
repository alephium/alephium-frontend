import '~/api/reactQueryPlatform'

import {
  ApiContextProvider,
  PersistQueryClientContextProvider,
  useAddressesDataPolling,
  useInitializeThrottledClient
} from '@alephium/shared-react'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View, ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components/native'

import ToastAnchor from '~/components/toasts/ToastAnchor'
import Devtools from '~/Devtools'
import LoadingManager from '~/features/loader/LoadingManager'
import { useLocalization } from '~/features/localization/useLocalization'
import usePersistQueryCacheOnBackground from '~/features/persistQueryCache/usePersistQueryCacheOnBackground'
import { useSystemRegion } from '~/features/settings/regionSettings/useSystemRegion'
import useLoadStoredSettings from '~/features/settings/useLoadStoredSettings'
import useIsQueryCacheRestored from '~/hooks/appLaunch/useIsQueryCacheRestored'
import useMigrateStorage from '~/hooks/appLaunch/useMigrateStorage'
import useShowAppContentAfterValidatingStoredWalletData from '~/hooks/appLaunch/useShowAppContentAfterValidatingStoredWalletData'
import { useAppSelector } from '~/hooks/redux'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { createTanstackAsyncStoragePersister } from '~/persistent-storage/tanstackAsyncStoragePersister'
import { store } from '~/store/store'
import { themes } from '~/style/themes'

// TODO: Delete after everyone has migrated to MMKV
const App = () => {
  const hasMigrated = useMigrateStorage()

  if (!hasMigrated) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return <AppContent />
}

export default App

const AppContent = () => (
  <Provider store={store}>
    <PersistQueryClientContextProvider createPersister={createTanstackAsyncStoragePersister}>
      <StateAwareContent />
    </PersistQueryClientContextProvider>
  </Provider>
)

const StateAwareContent = ({ children, ...props }: ViewProps) => {
  const activeThemeName = useAppSelector((state) => state.settings.theme)
  const theme = themes[activeThemeName] || themes.light

  useLoadStoredSettings()
  useLocalization()
  useSystemRegion()

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      <ThemeProvider theme={theme}>
        <StatusBar animated translucent style="light" />

        <AppRoutes />

        <ToastAnchor />
        <LoadingManager />
      </ThemeProvider>
      {__DEV__ && <Devtools />}
    </SafeAreaProvider>
  )
}

const AppRoutes = () => {
  const { showAppContent, wasMetadataRestored } = useShowAppContentAfterValidatingStoredWalletData()
  const isQueryCacheRestored = useIsQueryCacheRestored()

  if (showAppContent && isQueryCacheRestored) {
    return <Routes initialRouteName={wasMetadataRestored ? 'ImportWalletAddressDiscoveryScreen' : undefined} />
  }

  return null
}

const Routes = ({ initialRouteName }: { initialRouteName: keyof RootStackParamList | undefined }) => {
  useInitializeThrottledClient()
  usePersistQueryCacheOnBackground()
  useAddressesDataPolling()

  return (
    <ApiContextProvider>
      <RootStackNavigation initialRouteName={initialRouteName} />
    </ApiContextProvider>
  )
}
