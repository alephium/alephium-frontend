import { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { MMKV } from 'react-native-mmkv'

const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE'

// Custom persister that writes to MMKV synchronously.
// We don't use createSyncStoragePersister because it wraps persistClient
// in a throttle (default 1000ms setTimeout), which means the actual MMKV
// write is deferred. This causes data loss when the app is backgrounded
// or when switching wallets — the save appears to complete but the write
// hasn't happened yet, so restore finds nothing.
export const createTanstackAsyncStoragePersister = (key: string): Persister => {
  const storage = new MMKV({ id: key })

  return {
    persistClient: (persistedClient: PersistedClient) => {
      storage.set(CACHE_KEY, JSON.stringify(persistedClient))
    },
    restoreClient: () => {
      const cacheString = storage.getString(CACHE_KEY)

      if (!cacheString) return

      return JSON.parse(cacheString) as PersistedClient
    },
    removeClient: () => {
      storage.delete(CACHE_KEY)
    }
  }
}
