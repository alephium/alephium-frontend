import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

const usePersistQueryCacheOnBackground = () => {
  const appState = useRef(AppState.currentState)
  const walletId = useAppSelector((s) => s.wallet.id)
  const { persistQueryCache } = usePersistQueryClientContext()

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
        persistQueryCache(walletId)
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [persistQueryCache, walletId])

  return persistQueryCache
}

export default usePersistQueryCacheOnBackground
