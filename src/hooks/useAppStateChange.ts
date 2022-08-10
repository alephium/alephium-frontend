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

import { useCallback, useEffect, useRef } from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'

import { navigateRootStack } from '../navigation/RootStackNavigation'
import { getStoredActiveWallet } from '../storage/wallets'
import { activeWalletChanged, walletFlushed } from '../store/activeWalletSlice'
import { pinFlushed } from '../store/credentialsSlice'
import { useAppDispatch, useAppSelector } from './redux'

export const useAppStateChange = () => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const activeWallet = useAppSelector((state) => state.activeWallet)

  const getWalletFromStorageAndNavigate = useCallback(async () => {
    try {
      const storedActiveWallet = await getStoredActiveWallet()
      if (storedActiveWallet === null) {
        navigateRootStack('LandingScreen')
      } else if (storedActiveWallet.authType === 'pin') {
        navigateRootStack('LoginScreen', { storedWallet: storedActiveWallet })
      } else if (storedActiveWallet.authType === 'biometrics') {
        dispatch(activeWalletChanged(storedActiveWallet))
        navigateRootStack('DashboardScreen')
      } else {
        throw new Error('Unknown auth type')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // TODO: Revisit error handling with proper error codes
    } catch (e: any) {
      if (e.message === 'User canceled the authentication') {
        Alert.alert('Authentication required', 'Please authenticate to unlock your wallet.', [
          { text: 'Try again', onPress: getWalletFromStorageAndNavigate }
        ])
      } else if (e.message === 'No biometrics are currently enrolled') {
        Alert.alert(
          'Authentication required',
          'This wallet is only accessibly via biometrics authentication, please set up biometrics (fingerprint) on your device settings and try again.'
        )
      } else {
        console.error(e)
      }
    }
  }, [dispatch])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        dispatch(pinFlushed())
        dispatch(walletFlushed())
      } else if (nextAppState === 'active' && !activeWallet.mnemonic) {
        navigateRootStack('SplashScreen')

        if (!activeWallet.mnemonic) {
          getWalletFromStorageAndNavigate()
        }
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [activeWallet.mnemonic, dispatch, getWalletFromStorageAndNavigate])
}
