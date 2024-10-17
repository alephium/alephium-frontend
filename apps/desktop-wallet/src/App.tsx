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

import { localStorageNetworkSettingsMigrated } from '@alephium/shared'
import { useInitializeThrottledClient } from '@alephium/shared-react'
import { ReactNode, useCallback, useEffect } from 'react'
import styled, { css, ThemeProvider } from 'styled-components'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import AppSpinner from '@/components/AppSpinner'
import { CenteredSection } from '@/components/PageComponents/PageContainers'
import SnackbarManager from '@/components/SnackbarManager'
import SplashScreen from '@/components/SplashScreen'
import useAnalytics from '@/features/analytics/useAnalytics'
import useTrackUserSettings from '@/features/analytics/useTrackUserSettings'
import AutoUpdateSnackbar from '@/features/autoUpdate/AutoUpdateSnackbar'
import useAddressesDataPolling from '@/features/dataPolling/useAddressesDataPolling'
import { WalletConnectContextProvider } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAutoLock from '@/hooks/useAutoLock'
import AppModals from '@/modals/AppModals'
import Router from '@/routes'
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
import { GlobalStyle } from '@/style/globalStyles'
import { darkTheme, lightTheme } from '@/style/themes'
import { migrateGeneralSettings, migrateNetworkSettings, migrateWalletData } from '@/utils/migration'
import { electron } from '@/utils/misc'
import { languageOptions } from '@/utils/settings'

const App = () => {
  const theme = useAppSelector((s) => s.global.theme)

  useAutoLock()
  useAddressesDataPolling()

  useMigrateStoredSettings()
  useTrackUserSettings()

  useInitializeThrottledClient()
  useInitializeNetworkProxy()
  useInitializeTokenPrices()

  useSystemTheme()
  useSystemLanguage()

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      <SplashScreen />

      <WalletConnectContextProvider>
        <AppContainer>
          <CenteredSection>
            <Router />
          </CenteredSection>
        </AppContainer>

        <AppModals />
      </WalletConnectContextProvider>
      <SnackbarManager />
      <AutoUpdateSnackbar />
      <AppSpinner />
    </ThemeProvider>
  )
}

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
  }, [dispatch, theme])
}

const useInitializeTokenPrices = () => useFetchTokenPrices()

const useMigrateStoredSettings = () => {
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()

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
}

const useSystemLanguage = () => {
  const dispatch = useAppDispatch()
  const language = useAppSelector((s) => s.settings.language)

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
  }, [dispatch])

  useEffect(() => {
    if (language === undefined) setSystemLanguage()
  }, [language, setSystemLanguage])
}

const useInitializeNetworkProxy = () => {
  const networkProxy = useAppSelector((s) => s.network.settings.proxy)

  useEffect(() => {
    if (networkProxy) electron?.app.setProxySettings(networkProxy)
  }, [networkProxy])
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
