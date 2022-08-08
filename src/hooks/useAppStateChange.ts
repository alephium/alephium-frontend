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
import { AppState, AppStateStatus } from 'react-native'

import { navigate } from '../navigation/RootStackNavigation'
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
        navigate('LandingScreen')
      } else if (storedActiveWallet.authType === 'pin') {
        navigate('LoginScreen', { storedWallet: storedActiveWallet })
      } else if (storedActiveWallet.authType === 'biometrics') {
        dispatch(activeWalletChanged(storedActiveWallet))
        navigate('DashboardScreen')
      } else {
        throw new Error('Unknown auth type')
      }
    } catch (e) {
      console.error(e)
      // TODO: Handle following 2 cases:
      // 1. User cancels biometric authentication even though the fetched wallet is stored with biometrics auth
      // required. Show a message something like "You have to authenticate with your biometrics to access this wallet"
      // 2. User had previously stored their wallet with biometrics auth, but in the meantime they removed their
      // biometrics setup from their device. Show a message something like "This wallet is only accessibly via
      // biometrics authentication, please set up biometrics on your device settings and try again."
    }
  }, [dispatch])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        dispatch(pinFlushed())
        dispatch(walletFlushed())
      } else if (nextAppState === 'active' && !activeWallet.mnemonic) {
        navigate('SplashScreen')

        if (!activeWallet.mnemonic) {
          getWalletFromStorageAndNavigate()
        }
      }

      appState.current = nextAppState
      console.log('AppState:', appState.current)
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [activeWallet.mnemonic, dispatch, getWalletFromStorageAndNavigate])
}
