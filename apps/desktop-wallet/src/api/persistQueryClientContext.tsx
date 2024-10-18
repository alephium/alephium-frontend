/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

import queryClient from '@/api/queryClient'
import { createTanstackIndexedDBPersister } from '@/storage/tanstackIndexedDBPersister'

export type PersistQueryClientProviderProps = QueryClientProviderProps & {
  persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'>
}

export interface PersistQueryClientContextType {
  restoreQueryCache: (walletId: string, isPassphraseUsed?: boolean) => Promise<void>
  clearQueryCache: () => void
}

export const initialPersistQueryClientContext: PersistQueryClientContextType = {
  restoreQueryCache: () => Promise.resolve(),
  clearQueryCache: () => {}
}

export const PersistQueryClientContext = createContext<PersistQueryClientContextType>(initialPersistQueryClientContext)

// Inspired by https://github.com/TanStack/query/blob/1adaf3ff86fa2bf720dbc958714c60553c4aae08/packages/react-query-persist-client/src/PersistQueryClientProvider.tsx
export const PersistQueryClientContextProvider = ({ children }: { children: ReactNode }) => {
  const [isRestoring, setIsRestoring] = useState(true)
  const [unsubscribeFromQueryClientFn, setUnsubscribeFromQueryClientFn] = useState(() => () => {})

  const clearQueryCache = useCallback(() => {
    unsubscribeFromQueryClientFn()

    queryClient.clear()
  }, [unsubscribeFromQueryClientFn])

  const restoreQueryCache = useCallback(async (walletId: string, isPassphraseUsed?: boolean) => {
    setIsRestoring(true)

    if (!isPassphraseUsed) {
      const options: PersistQueryClientOptions = {
        queryClient,
        maxAge: Infinity,
        persister: createTanstackIndexedDBPersister('tanstack-cache-for-wallet-' + walletId),
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
  }, [])

  return (
    <PersistQueryClientContext.Provider value={{ restoreQueryCache, clearQueryCache }}>
      <QueryClientProvider client={queryClient}>
        <IsRestoringProvider value={isRestoring}>{children}</IsRestoringProvider>
      </QueryClientProvider>
    </PersistQueryClientContext.Provider>
  )
}

export const usePersistQueryClientContext = () => useContext(PersistQueryClientContext)
