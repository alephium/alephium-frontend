import { sleep } from '@alephium/web3'
import {
  PersistQueryClientOptions,
  persistQueryClientRestore,
  persistQueryClientSave
} from '@tanstack/query-persist-client-core'
import {
  defaultShouldDehydrateQuery,
  IsRestoringProvider,
  OmitKeyof,
  QueryClientProvider,
  QueryClientProviderProps
} from '@tanstack/react-query'
import { Persister } from '@tanstack/react-query-persist-client'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

import { queryClient } from '@/api/queryClient'
import { useIsExplorerOffline } from '@/network'

export type PersistQueryClientProviderProps = QueryClientProviderProps & {
  persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'>
}

export interface PersistQueryClientContextType {
  persistQueryCache: (walletId: string) => Promise<void>
  restoreQueryCache: (walletId: string, isPassphraseUsed?: boolean) => Promise<void>
  deletePersistedCache: (walletId: string, isPassphraseUsed?: boolean) => void
  clearQueryCache: () => void
}

export const initialPersistQueryClientContext: PersistQueryClientContextType = {
  persistQueryCache: () => Promise.resolve(),
  restoreQueryCache: () => Promise.resolve(),
  deletePersistedCache: () => null,
  clearQueryCache: () => null
}

export const PersistQueryClientContext = createContext<PersistQueryClientContextType>(initialPersistQueryClientContext)

interface PersistQueryClientContextProviderProps {
  children: ReactNode
  createPersister: (key: string) => Persister
}

// Inspired by https://github.com/TanStack/query/blob/1adaf3ff86fa2bf720dbc958714c60553c4aae08/packages/react-query-persist-client/src/PersistQueryClientProvider.tsx
export const PersistQueryClientContextProvider = ({
  children,
  createPersister
}: PersistQueryClientContextProviderProps) => {
  const isExplorerOffline = useIsExplorerOffline()

  const [isRestoring, setIsRestoring] = useState(false)

  const clearQueryCache = useCallback(() => {
    queryClient.clear()
  }, [])

  const persistQueryCache = useCallback(
    async (walletId: string) => {
      if (isExplorerOffline) return

      console.log('⤵️ saving query client for wallet', walletId)

      try {
        await persistQueryClientSave({
          queryClient,
          persister: createPersister(getPersisterKey(walletId)),
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              query.meta?.['isMainnet'] === false ? false : defaultShouldDehydrateQuery(query)
          }
        })

        console.log('✅ query client saved')
      } catch (error) {
        console.error('Error saving query client for wallet', walletId, error)
      }
    },
    [createPersister, isExplorerOffline]
  )

  const restoreQueryCache = useCallback(
    async (walletId: string, isPassphraseUsed?: boolean) => {
      setIsRestoring(true)

      if (!isPassphraseUsed) {
        const options: PersistQueryClientOptions = {
          queryClient,
          maxAge: Infinity,
          persister: createPersister(getPersisterKey(walletId)),
          dehydrateOptions: undefined
        }

        await persistQueryClientRestore(options)
      } else {
        // Even when we don't restore data in the case of passphrase wallet, we need to set `isRestoring` to `true` and
        // then to `false` to make sure the useQuery instances are reset.
        await sleep(500)
      }

      setIsRestoring(false)
    },
    [createPersister]
  )

  const deletePersistedCache = useCallback(
    (walletId: string) => {
      createPersister(getPersisterKey(walletId)).removeClient()
    },
    [createPersister]
  )

  return (
    <PersistQueryClientContext.Provider
      value={{ persistQueryCache, restoreQueryCache, clearQueryCache, deletePersistedCache }}
    >
      <QueryClientProvider client={queryClient}>
        <IsRestoringProvider value={isRestoring}>{children}</IsRestoringProvider>
      </QueryClientProvider>
    </PersistQueryClientContext.Provider>
  )
}

export const usePersistQueryClientContext = () => useContext(PersistQueryClientContext)

export const getPersisterKey = (walletId: string) => 'tanstack-cache-for-wallet-' + walletId
