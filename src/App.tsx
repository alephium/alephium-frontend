/*
Copyright 2018 - 2022 The Alephium Authors
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

import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { isEnrolledAsync } from 'expo-local-authentication'
import { StatusBar } from 'expo-status-bar'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useInitializeClient from '~/hooks/useInitializeClient'
import useLoadStoredSettings from '~/hooks/useLoadStoredSettings'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import {
  areThereOtherWallets,
  deriveWalletStoredAddresses,
  disableBiometrics,
  getActiveWalletMetadata,
  getStoredActiveWallet,
  rememberActiveWallet
} from '~/persistent-storage/wallets'
import { biometricsDisabled, walletUnlocked } from '~/store/activeWalletSlice'
import { appBecameInactive } from '~/store/appSlice'
import { store } from '~/store/store'
import { themes } from '~/style/themes'
import { navigateRootStack, resetNavigationState, setNavigationState } from '~/utils/navigation'

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'some sec',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy'
  }
})

const App = () => {
  const [theme, setTheme] = useState<DefaultTheme>(themes.light)

  useEffect(
    () =>
      store.subscribe(() => {
        setTheme(themes[store.getState().settings.theme])
      }),
    []
  )

  return (
    <Provider store={store}>
      <Main>
        <ThemeProvider theme={theme}>
          <RootStackNavigation />
          <StatusBar style={theme.name === 'light' ? 'dark' : 'light'} />
        </ThemeProvider>
      </Main>
    </Provider>
  )
}

const Main = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const addressesStatus = useAppSelector((s) => s.addresses.status)

  useInitializeClient()
  useLoadStoredSettings()

  const unlockActiveWallet = useCallback(async () => {
    if (activeWalletMnemonic) return

    const hasAvailableBiometrics = await isEnrolledAsync()

    try {
      const activeWalletMetadata = await getActiveWalletMetadata()

      // Disable biometrics if needed
      if (activeWalletMetadata && activeWalletMetadata.authType === 'biometrics' && !hasAvailableBiometrics) {
        await disableBiometrics(activeWalletMetadata.id)
        dispatch(biometricsDisabled())
      }

      const wallet = await getStoredActiveWallet()

      if (!wallet) {
        if (await areThereOtherWallets()) {
          navigateRootStack('SwitchWalletAfterDeletionScreen')
        } else if (lastNavigationState) {
          setNavigationState(lastNavigationState)
        } else {
          navigateRootStack('LandingScreen')
        }
        return
      }

      if (wallet.authType === 'pin') {
        navigateRootStack('LoginScreen', { walletIdToLogin: wallet.metadataId, workflow: 'wallet-unlock' })
        return
      }

      if (wallet.authType === 'biometrics') {
        await rememberActiveWallet(wallet.metadataId)

        const addressesToInitialize =
          addressesStatus === 'uninitialized' ? await deriveWalletStoredAddresses(wallet) : []
        dispatch(walletUnlocked({ wallet, addressesToInitialize, contacts: activeWalletMetadata?.contacts ?? [] }))

        lastNavigationState ? setNavigationState(lastNavigationState) : resetNavigationState()
      }
      // TODO: Revisit error handling with proper error codes
    } catch (e: unknown) {
      const error = e as { message?: string }
      if (error.message === 'User canceled the authentication') {
        Alert.alert('Authentication required', 'Please authenticate to unlock your wallet.', [
          { text: 'Try again', onPress: unlockActiveWallet }
        ])
      } else {
        console.error(e)
      }
    }
  }, [activeWalletMnemonic, addressesStatus, dispatch, lastNavigationState])

  useEffect(() => {
    if (!activeWalletMnemonic) unlockActiveWallet()

    // We want this to only run 1 time and not every time lastNavigationState changes (dep of unlockActiveWallet)
    // TODO: Revisit this approach.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWalletMnemonic])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/) && !isCameraOpen) {
        dispatch(appBecameInactive())
      } else if (nextAppState === 'active' && !activeWalletMnemonic) {
        unlockActiveWallet()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return subscription.remove
  }, [activeWalletMnemonic, dispatch, isCameraOpen, unlockActiveWallet])

  return (
    <RootSiblingParent>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </RootSiblingParent>
  )
}

export default App
