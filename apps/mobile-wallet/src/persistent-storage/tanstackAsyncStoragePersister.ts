import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MMKV } from 'react-native-mmkv'

export const createTanstackAsyncStoragePersister = (key: string) => {
  const storage = new MMKV({ id: key })

  const clientStorage = {
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    getItem: (key: string) => {
      const value = storage.getString(key)
      return value === undefined ? null : value
    },
    removeItem: (key: string) => {
      storage.delete(key)
    }
  }

  return createSyncStoragePersister({ storage: clientStorage })
}
