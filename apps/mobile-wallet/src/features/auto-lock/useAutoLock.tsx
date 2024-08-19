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

import { appBecameInactive } from '@alephium/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import BackgroundTimer from 'react-native-background-timer'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'

interface UseAutoLockProps {
  unlockApp: () => Promise<void>
  onAuthRequired: () => void
}

let lockTimer: number | undefined

const useAutoLock = ({ unlockApp, onAuthRequired }: UseAutoLockProps) => {
  const appState = useRef<AppStateStatus>('active')
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const [isAppStateChangeCallbackRegistered, setIsAppStateChangeCallbackRegistered] = useState(false)

  const lockApp = useCallback(() => {
    if (biometricsRequiredForAppAccess) onAuthRequired()

    dispatch(appBecameInactive())
  }, [biometricsRequiredForAppAccess, dispatch, onAuthRequired])

  useEffect(() => {
    if (!settingsLoadedFromStorage) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (autoLockSeconds !== -1) {
        if (nextAppState === 'background' && isWalletUnlocked && !isCameraOpen) {
          if (autoLockSeconds === 0) {
            lockApp()
          } else {
            clearBackgroundTimer()
            lockTimer = BackgroundTimer.setTimeout(() => {
              if (lockTimer) {
                lockApp()
              }
            }, autoLockSeconds * 1000)
          }
        } else if (nextAppState === 'active') {
          clearBackgroundTimer()

          if (!isWalletUnlocked && !isCameraOpen) {
            unlockApp()
          }
        }
      } else if (nextAppState === 'active' && !isWalletUnlocked) {
        unlockApp()
      }

      appState.current = nextAppState
    }

    if (!isAppStateChangeCallbackRegistered && appState.current === 'active') {
      handleAppStateChange('active')
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    setIsAppStateChangeCallbackRegistered(true)

    return subscription.remove
  }, [
    autoLockSeconds,
    biometricsRequiredForAppAccess,
    dispatch,
    isAppStateChangeCallbackRegistered,
    isCameraOpen,
    isWalletUnlocked,
    lockApp,
    settingsLoadedFromStorage,
    unlockApp
  ])

  const clearBackgroundTimer = () => {
    if (lockTimer) {
      BackgroundTimer.clearTimeout(lockTimer)
      lockTimer = undefined
    }
  }
}

export default useAutoLock
