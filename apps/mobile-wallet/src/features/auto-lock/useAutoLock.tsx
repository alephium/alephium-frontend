import { appBecameInactive } from '@alephium/shared/store'
import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'

let backgroundedAt: number | undefined

const useAutoLock = (unlockApp: () => Promise<void>) => {
  const appState = useRef<AppStateStatus>('active')
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const [isAppStateChangeCallbackRegistered, setIsAppStateChangeCallbackRegistered] = useState(false)

  useEffect(() => {
    if (!settingsLoadedFromStorage) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (autoLockSeconds !== -1) {
        if (nextAppState === 'background' && isWalletUnlocked && !isCameraOpen) {
          if (autoLockSeconds === 0) {
            dispatch(appBecameInactive())
          } else {
            // eslint-disable-next-line react-compiler/react-compiler
            backgroundedAt = Date.now()
          }
        } else if (nextAppState === 'active') {
          const backgroundedForLong =
            backgroundedAt !== undefined && Date.now() - backgroundedAt >= autoLockSeconds * 1000
          // eslint-disable-next-line react-compiler/react-compiler
          backgroundedAt = undefined

          if (backgroundedForLong && isWalletUnlocked) {
            dispatch(appBecameInactive())
          }

          if ((backgroundedForLong || !isWalletUnlocked) && !isCameraOpen) {
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
    settingsLoadedFromStorage,
    unlockApp
  ])
}

export default useAutoLock
