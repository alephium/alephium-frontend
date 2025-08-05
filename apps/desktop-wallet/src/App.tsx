import { localStorageNetworkSettingsMigrated, storedSharedSettingsLoaded } from '@alephium/shared'
import { useInitializeThrottledClient } from '@alephium/shared-react'
import { clear as clearIndexedDB } from 'idb-keyval'
import { memo, ReactNode, useCallback, useEffect, useState } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import PersistedQueryCacheVersionStorage from '@/api/persistedCacheVersionStorage'
import AnimatedBackground from '@/components/AnimatedBackground'
import AppSpinner from '@/components/AppSpinner'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SplashScreen from '@/components/SplashScreen'
import useAnalytics from '@/features/analytics/useAnalytics'
import useTrackUserSettings from '@/features/analytics/useTrackUserSettings'
import { languageOptions } from '@/features/localization/languages'
import { systemLanguageMatchFailed, systemLanguageMatchSucceeded } from '@/features/localization/localizationActions'
import useRegionOptions from '@/features/settings/regionSettings/useRegionOptions'
import {
  localStorageGeneralSettingsMigrated,
  systemRegionMatchFailed,
  systemRegionMatchSucceeded
} from '@/features/settings/settingsActions'
import { darkTheme, lightTheme } from '@/features/theme/themes'
import ToastMessagesModal from '@/features/toastMessages/ToastMessagesModal'
import { WalletConnectContextProvider } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAutoLock from '@/hooks/useAutoLock'
import { AppModalsLockedWallet } from '@/modals/AppModals'
import Router from '@/routes'
import {
  devModeShortcutDetected,
  localStorageDataMigrationFailed,
  osThemeChangeDetected
} from '@/storage/global/globalActions'
import useClearQueryCacheOnWalletLock from '@/storage/tanstackQueryCache/useClearQueryCacheOnWalletLock'
import usePersistQueryCacheBeforeQuit from '@/storage/tanstackQueryCache/usePersistQueryCacheBeforeQuit'
import { selectIsWalletUnlocked } from '@/storage/wallets/walletSelectors'
import { GlobalStyle } from '@/style/globalStyles'
import { currentVersion } from '@/utils/app-data'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'

const App = memo(() => {
  const theme = useAppSelector((s) => s.global.theme)

  useAutoLock()

  useMigrateStoredSettings()
  useTrackUserSettings()

  useClearQueryCacheOnWalletLock()
  useClearPersistedQueryCacheOnVersionUpdate()
  usePersistQueryCacheBeforeQuit()

  useInitializeThrottledClient()
  useInitializeNetworkProxy()

  useSystemTheme()
  useSystemLanguage()
  useSystemRegion()

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <SplashScreen />
      <AppModalsLockedWallet />
      <WalletConnectContextProvider>
        <AppContainer>
          <CenteredSection>
            <LoginAnimatedBackground />
            <Router />
          </CenteredSection>
        </AppContainer>
      </WalletConnectContextProvider>
      <ToastMessagesModal />
      <AppSpinner />
    </ThemeProvider>
  )
})

export default App

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

const useSystemTheme = () => {
  const theme = useAppSelector((s) => s.settings.theme)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const shouldListenToOSThemeChanges = theme === 'system'

    if (!shouldListenToOSThemeChanges) return

    const removeOSThemeChangeListener = window.electron?.theme.onShouldUseDarkColors((useDark: boolean) =>
      dispatch(osThemeChangeDetected(useDark ? 'dark' : 'light'))
    )

    const removeGetNativeThemeListener = window.electron?.theme.onGetNativeTheme((nativeTheme) =>
      dispatch(osThemeChangeDetected(nativeTheme.shouldUseDarkColors ? 'dark' : 'light'))
    )

    window.electron?.theme.getNativeTheme()

    return () => {
      removeGetNativeThemeListener && removeGetNativeThemeListener()
      removeOSThemeChangeListener && removeOSThemeChangeListener()
    }
  }, [dispatch, theme])
}

const useMigrateStoredSettings = () => {
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()

  useEffect(() => {
    try {
      const generalSettings = migrateGeneralSettings()
      const networkSettings = migrateNetworkSettings()
      migrateWalletData()

      dispatch(localStorageGeneralSettingsMigrated(generalSettings))
      dispatch(storedSharedSettingsLoaded({ fiatCurrency: generalSettings.fiatCurrency }))
      dispatch(localStorageNetworkSettingsMigrated(networkSettings))
    } catch {
      sendAnalytics({ type: 'error', message: 'Local storage data migration failed' })
      dispatch(localStorageDataMigrationFailed())
    }
  }, [dispatch, sendAnalytics])
}

const useSystemRegion = () => {
  const dispatch = useAppDispatch()
  const region = useAppSelector((s) => s.settings.region)
  const regionOptions = useRegionOptions()

  useEffect(() => {
    if (region === undefined)
      window.electron?.app.getSystemRegion().then((systemRegion) => {
        if (!systemRegion) {
          dispatch(systemRegionMatchFailed())
          return
        }

        const systemRegionCode = systemRegion.substring(3)
        const matchedRegion = regionOptions.find(
          (region) => region.value === systemRegion || region.value.endsWith(systemRegionCode)
        )

        if (matchedRegion) {
          dispatch(systemRegionMatchSucceeded(matchedRegion.value))
        } else {
          dispatch(systemRegionMatchFailed())
        }
      })
  }, [dispatch, region, regionOptions])
}

const useSystemLanguage = () => {
  const dispatch = useAppDispatch()
  const language = useAppSelector((s) => s.settings.language)

  const setSystemLanguage = useCallback(async () => {
    const systemLanguage = await window.electron?.app.getSystemLanguage()

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
  }, [dispatch])

  useEffect(() => {
    if (language === undefined) setSystemLanguage()
  }, [language, setSystemLanguage])
}

const useInitializeNetworkProxy = () => {
  const networkProxy = useAppSelector((s) => s.network.settings.proxy)

  useEffect(() => {
    if (networkProxy) window.electron?.app.setProxySettings(networkProxy)
  }, [networkProxy])
}

const useClearPersistedQueryCacheOnVersionUpdate = () => {
  useEffect(() => {
    const cacheVersion = PersistedQueryCacheVersionStorage.load()

    if (cacheVersion !== currentVersion) {
      clearIndexedDB()

      PersistedQueryCacheVersionStorage.set(currentVersion)
    }
  }, [])
}

interface AppContainerProps {
  children: ReactNode
}

const AppContainer = ({ children }: AppContainerProps) => {
  const showDevIndication = useDevModeShortcut()

  return <AppContainerStyled showDevIndication={showDevIndication}>{children}</AppContainerStyled>
}

const AppContainerStyled = styled.div<{ showDevIndication: boolean }>`
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

const LoginAnimatedBackground = () => {
  const isWalletUnlocked = useAppSelector(selectIsWalletUnlocked)

  const [isWindowFocused, setIsWindowFocused] = useState(true)

  useEffect(() => {
    if (window.electron) {
      const removeFocusListener = window.electron.window.onFocusChange((focused) => {
        setIsWindowFocused(focused)
      })

      return removeFocusListener
    }
  }, [])

  if (isWalletUnlocked || !isWindowFocused) return null

  return <AnimatedBackground anchorPosition="bottom" opacity={1} verticalOffset={-100} hiddenOverflow />
}
