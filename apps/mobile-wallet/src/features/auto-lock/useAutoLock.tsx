import { appBecameInactive } from '@alephium/shared'
import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import BackgroundTimer from 'react-native-background-timer'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'

let lockTimer: number | undefined

const useAutoLock = (unlockApp: () => Promise<void>) => {
  const appState = useRef<AppStateStatus>('active')
  const unlockAppRef = useRef(unlockApp)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const [isAppStateChangeCallbackRegistered, setIsAppStateChangeCallbackRegistered] = useState(false)

  // Update ref when unlockApp changes
  useEffect(() => {
    unlockAppRef.current = unlockApp
  }, [unlockApp])

  useEffect(() => {
    if (!settingsLoadedFromStorage) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (autoLockSeconds !== -1) {
        if (nextAppState === 'background' && isWalletUnlocked && !isCameraOpen) {
          if (autoLockSeconds === 0) {
            dispatch(appBecameInactive())
          } else {
            clearBackgroundTimer()
            lockTimer = BackgroundTimer.setTimeout(() => {
              if (lockTimer) {
                dispatch(appBecameInactive())
              }
            }, autoLockSeconds * 1000)
          }
        } else if (nextAppState === 'active') {
          clearBackgroundTimer()

          if (!isWalletUnlocked && !isCameraOpen) {
            unlockAppRef.current()
          }
        }
      } else if (nextAppState === 'active' && !isWalletUnlocked) {
        unlockAppRef.current()
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
    settingsLoadedFromStorage
  ])

  const clearBackgroundTimer = () => {
    if (lockTimer) {
      BackgroundTimer.clearTimeout(lockTimer)
      // eslint-disable-next-line react-compiler/react-compiler
      lockTimer = undefined
    }
  }
}

export default useAutoLock
