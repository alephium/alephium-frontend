import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

export const createTanstackAsyncStoragePersister = (key: string) =>
  createAsyncStoragePersister({
    key,
    storage: AsyncStorage
  })
