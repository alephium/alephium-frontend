import { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { del, get, set } from 'idb-keyval'

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 * @see https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient#building-a-persister
 */
export const createTanstackIndexedDBPersister = (idbValidKey: IDBValidKey = 'tanstackQuery') =>
  ({
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client)
    },
    restoreClient: async () => await get<PersistedClient>(idbValidKey),
    removeClient: async () => {
      await del(idbValidKey)
    }
  }) as Persister
