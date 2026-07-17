import { isTokenResolutionFallback } from '@alephium/shared/types'
import { sleep } from '@alephium/web3'
import { PersistQueryClientOptions, persistQueryClientSave } from '@tanstack/query-persist-client-core'
import {
  defaultShouldDehydrateQuery,
  hydrate,
  IsRestoringProvider,
  OmitKeyof,
  Query,
  QueryClientProvider,
  QueryClientProviderProps
} from '@tanstack/react-query'
import { Persister } from '@tanstack/react-query-persist-client'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

import { queryClient } from '../api/queryClient'
import { useIsExplorerOffline } from '../network'

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

      const queriesCount = queryClient.getQueryCache().getAll().length
      console.log(`⤵️ saving query client for wallet ${walletId} (${queriesCount} queries)`)

      try {
        await persistQueryClientSave({
          queryClient,
          persister: createPersister(getPersisterKey(walletId)),
          dehydrateOptions: { shouldDehydrateQuery }
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
        // TODO: Add buster: CACHE_SCHEMA_VERSION (global variable) for when I want to force a cache refresh to
        // everyone who updates. Useful for when the API schema or the cached query shapes change.
        await restoreQueryCacheInChunks(createPersister(getPersisterKey(walletId)))
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

// Token resolution fallbacks are placeholders for data that could not be fetched, not real data, so they must not
// outlive the session by being persisted to disk.
export const shouldDehydrateQuery = (query: Query) =>
  query.meta?.['isMainnet'] === false || isTokenResolutionFallback(query.state.data)
    ? false
    : defaultShouldDehydrateQuery(query)

const RESTORE_CHUNK_SIZE = 250

// Equivalent to persistQueryClientRestore but hydrating in chunks that yield to the event loop, so that restoring
// thousands of queries (and scheduling their gc timers) does not block the main thread in one long task at unlock.
const restoreQueryCacheInChunks = async (persister: Persister) => {
  try {
    const persistedClient = await persister.restoreClient()

    if (!persistedClient) return

    const { queries, mutations } = persistedClient.clientState

    hydrate(queryClient, { queries: [], mutations })

    for (let i = 0; i < queries.length; i += RESTORE_CHUNK_SIZE) {
      hydrate(queryClient, { queries: queries.slice(i, i + RESTORE_CHUNK_SIZE), mutations: [] })

      if (i + RESTORE_CHUNK_SIZE < queries.length) await yieldToEventLoop()
    }
  } catch (error) {
    console.error('Error restoring query client', error)
    persister.removeClient()
  }
}

const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve))
