import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useEffect, useRef } from 'react'
import { AppState, Platform } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

const usePersistQueryCacheOnBackground = () => {
  const appState = useRef(AppState.currentState)
  const walletId = useAppSelector((s) => s.wallet.id)
  const { persistQueryCache } = usePersistQueryClientContext()

  useEffect(() => {
    const changeListenerSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
        persistQueryCache(walletId)
      }

      appState.current = nextAppState
    })

    if (Platform.OS === 'android') {
      const blurListenerSubscription = AppState.addEventListener('blur', () => {
        persistQueryCache(walletId)
      })

      return () => {
        changeListenerSubscription.remove()
        blurListenerSubscription.remove()
      }
    } else {
      return () => {
        changeListenerSubscription.remove()
      }
    }
  }, [persistQueryCache, walletId])

  return persistQueryCache
}

export default usePersistQueryCacheOnBackground
