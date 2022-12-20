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

import { isEnrolledAsync } from 'expo-local-authentication'
import { useCallback, useEffect, useRef } from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'

import {
  areThereOtherWallets,
  deriveWalletStoredAddresses,
  disableBiometrics,
  getActiveWalletMetadata,
  getStoredActiveWallet,
  rememberActiveWallet
} from '../persistent-storage/wallets'
import { activeWalletSwitched, biometricsDisabled } from '../store/activeWalletSlice'
import { appBecameInactive } from '../store/appSlice'
import { navigateRootStack, useRestoreNavigationState } from '../utils/navigation'
import { useAppDispatch, useAppSelector } from './redux'

export const useAppStateChange = () => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const [activeWallet, lastNavigationState, isCameraOpen, addressesStatus] = useAppSelector((s) => [
    s.activeWallet,
    s.app.lastNavigationState,
    s.app.isCameraOpen,
    s.addresses.status
  ])
  const restoreNavigationState = useRestoreNavigationState()

  const unlockWallet = useCallback(async () => {
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
          restoreNavigationState()
        } else {
          navigateRootStack('LandingScreen')
        }
        return
      }

      if (wallet.authType === 'pin') {
        navigateRootStack('LoginScreen', { walletIdToLogin: wallet.metadataId, workflow: 'app-login' })
        return
      }

      if (wallet.authType === 'biometrics') {
        await rememberActiveWallet(wallet.metadataId)

        const addressesToInitialize =
          addressesStatus === 'uninitialized' ? await deriveWalletStoredAddresses(wallet) : []
        dispatch(activeWalletSwitched({ wallet, addressesToInitialize }))

        restoreNavigationState()
      }
      // TODO: Revisit error handling with proper error codes
    } catch (e: unknown) {
      const error = e as { message?: string }
      if (error.message === 'User canceled the authentication') {
        Alert.alert('Authentication required', 'Please authenticate to unlock your wallet.', [
          { text: 'Try again', onPress: unlockWallet }
        ])
      } else {
        console.error(e)
      }
    }
  }, [addressesStatus, dispatch, lastNavigationState, restoreNavigationState])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/) && !isCameraOpen) {
        dispatch(appBecameInactive())
      } else if (nextAppState === 'active' && !activeWallet.mnemonic) {
        unlockWallet()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return subscription.remove
  }, [activeWallet.mnemonic, dispatch, isCameraOpen, unlockWallet])
}
