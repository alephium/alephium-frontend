import { sleep } from '@alephium/web3'
import {
  PersistQueryClientOptions,
  persistQueryClientRestore,
  persistQueryClientSubscribe
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

export type PersistQueryClientProviderProps = QueryClientProviderProps & {
  persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'>
}

export interface PersistQueryClientContextType {
  restoreQueryCache: (walletId: string, isPassphraseUsed?: boolean) => Promise<void>
  deletePersistedCache: (walletId: string, isPassphraseUsed?: boolean) => void
  clearQueryCache: () => void
}

export const initialPersistQueryClientContext: PersistQueryClientContextType = {
  restoreQueryCache: () => Promise.resolve(),
  deletePersistedCache: () => null,
  clearQueryCache: () => null
}

export const PersistQueryClientContext = createContext<PersistQueryClientContextType>(initialPersistQueryClientContext)

interface PersistQueryClientContextProviderProps {
  children: ReactNode
  createPersister: (id: string) => Persister
}

// Inspired by https://github.com/TanStack/query/blob/1adaf3ff86fa2bf720dbc958714c60553c4aae08/packages/react-query-persist-client/src/PersistQueryClientProvider.tsx
export const PersistQueryClientContextProvider = ({
  children,
  createPersister
}: PersistQueryClientContextProviderProps) => {
  const [isRestoring, setIsRestoring] = useState(true)
  const [unsubscribeFromQueryClientFn, setUnsubscribeFromQueryClientFn] = useState(() => () => {})

  const clearQueryCache = useCallback(() => {
    unsubscribeFromQueryClientFn()

    queryClient.clear()
  }, [unsubscribeFromQueryClientFn])

  const restoreQueryCache = useCallback(
    async (walletId: string, isPassphraseUsed?: boolean) => {
      setIsRestoring(true)

      if (!isPassphraseUsed) {
        const options: PersistQueryClientOptions = {
          queryClient,
          maxAge: Infinity,
          persister: createPersister('tanstack-cache-for-wallet-' + walletId),
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              query.meta?.['isMainnet'] === false ? false : defaultShouldDehydrateQuery(query)
          }
        }

        await persistQueryClientRestore(options)

        const newUnsubscribeFromQueryClientFn = persistQueryClientSubscribe(options)

        setUnsubscribeFromQueryClientFn(() => newUnsubscribeFromQueryClientFn)
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
      createPersister('tanstack-cache-for-wallet-' + walletId).removeClient()
    },
    [createPersister]
  )

  return (
    <PersistQueryClientContext.Provider value={{ restoreQueryCache, clearQueryCache, deletePersistedCache }}>
      <QueryClientProvider client={queryClient}>
        <IsRestoringProvider value={isRestoring}>{children}</IsRestoringProvider>
      </QueryClientProvider>
    </PersistQueryClientContext.Provider>
  )
}

export const usePersistQueryClientContext = () => useContext(PersistQueryClientContext)
