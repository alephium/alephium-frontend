import { queryClient } from '@alephium/shared-react'
import { PersistedClient, Persister, persistQueryClientSave } from '@tanstack/react-query-persist-client'
import { del, get, keys, set } from 'idb-keyval'

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

export const persisterExists = async (idbValidKey: IDBValidKey) => {
  const idbKeys = await keys()

  return idbKeys.includes(idbValidKey)
}

export const persistWalletQueryCache = async (walletId: string) => {
  console.log('⤵️ saving query client for wallet', walletId)

  try {
    await persistQueryClientSave({
      queryClient,
      persister: createTanstackIndexedDBPersister('tanstack-cache-for-wallet-' + walletId)
    })
  } catch (error) {
    console.error('Error saving query client for wallet', walletId, error)
  }

  console.log('✅ query client saved')

  await new Promise((resolve) => setTimeout(resolve, 1000)) // fake delay for debugging
}
