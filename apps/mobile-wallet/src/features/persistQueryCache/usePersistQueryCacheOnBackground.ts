import { usePersistQueryClientContext } from '@alephium/shared-react'
import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

const usePersistQueryCacheOnBackground = () => {
  const { persistQueryCache } = usePersistQueryClientContext()

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState<AppStateStatus>()
  const walletId = useAppSelector((s) => s.wallet.id)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
        console.log('App has come to the background!')
        persistQueryCache(walletId)
      }

      appState.current = nextAppState
      setAppStateVisible(appState.current)

      console.log('AppState', appState.current)
    })

    return () => {
      subscription.remove()
    }
  }, [persistQueryCache, walletId])

  return persistQueryCache
}

export default usePersistQueryCacheOnBackground
