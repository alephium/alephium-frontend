import { appBecameInactive } from '@alephium/shared/store'
import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const useAutoLock = (unlockApp: () => Promise<void>) => {
  const backgroundedAt = useRef<number | undefined>(undefined)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const [appStateStatus, setAppStateStatus] = useState<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    if (!settingsLoadedFromStorage) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (autoLockSeconds !== -1) {
        if (nextAppState === 'background' && isWalletUnlocked && !isCameraOpen) {
          if (autoLockSeconds === 0) {
            dispatch(appBecameInactive())
          } else {
            backgroundedAt.current = Date.now()
          }
        } else if (nextAppState === 'active') {
          const elapsed = backgroundedAt.current !== undefined ? Date.now() - backgroundedAt.current : undefined
          const backgroundedForLong = elapsed !== undefined && (elapsed < 0 || elapsed >= autoLockSeconds * 1000)
          backgroundedAt.current = undefined

          if (backgroundedForLong && isWalletUnlocked) {
            dispatch(appBecameInactive())
          }
        }
      }

      setAppStateStatus(nextAppState)
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return subscription.remove
  }, [
    autoLockSeconds,
    biometricsRequiredForAppAccess,
    dispatch,
    isCameraOpen,
    isWalletUnlocked,
    settingsLoadedFromStorage
  ])

  // Fire unlockApp from a separate effect so it runs on the next render with a fresh closure,
  // even when the AppState handler above just dispatched the lock in the same synchronous tick.
  useEffect(() => {
    if (!settingsLoadedFromStorage) return
    if (appStateStatus !== 'active') return
    if (!isWalletUnlocked && !isCameraOpen) {
      unlockApp()
    }
  }, [appStateStatus, isCameraOpen, isWalletUnlocked, settingsLoadedFromStorage, unlockApp])
}

export default useAutoLock
