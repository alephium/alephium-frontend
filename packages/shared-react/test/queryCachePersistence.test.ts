import { PersistedClient, Persister } from '@tanstack/query-persist-client-core'
import { dehydrate } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CACHE_SCHEMA_VERSION,
  restoreQueryCacheInChunks,
  shouldDehydrateQuery
} from '../src/api/persistQueryClientContext'
import { queryClient } from '../src/api/queryClient'

const PERSISTED_QUERY_KEY = ['token', 'persisted-id', { networkId: 0 }]
const PERSISTED_DATA = { id: 'persisted-id', name: 'Persisted Token', symbol: 'PT', decimals: 0 }

const makePersistedClient = (buster?: string): PersistedClient => {
  queryClient.setQueryData(PERSISTED_QUERY_KEY, PERSISTED_DATA)
  const clientState = dehydrate(queryClient, { shouldDehydrateQuery })
  queryClient.clear()

  return { timestamp: Date.now(), buster: buster as string, clientState }
}

const makePersister = (persistedClient?: PersistedClient) => {
  const removeClient = vi.fn()

  const persister: Persister = {
    persistClient: vi.fn(),
    restoreClient: () => persistedClient,
    removeClient
  }

  return { persister, removeClient }
}

afterEach(() => {
  queryClient.clear()
})

describe('restoreQueryCacheInChunks', () => {
  it('hydrates the cache when the persisted buster matches', async () => {
    const { persister, removeClient } = makePersister(makePersistedClient(CACHE_SCHEMA_VERSION))

    await restoreQueryCacheInChunks(persister)

    expect(queryClient.getQueryData(PERSISTED_QUERY_KEY)).toEqual(PERSISTED_DATA)
    expect(removeClient).not.toHaveBeenCalled()
  })

  it('removes the persisted cache and skips hydration on buster mismatch', async () => {
    const { persister, removeClient } = makePersister(makePersistedClient('0'))

    await restoreQueryCacheInChunks(persister)

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(removeClient).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, ''])('treats a payload persisted with buster %j as mismatched', async (legacyBuster) => {
    const { persister, removeClient } = makePersister(makePersistedClient(legacyBuster))

    await restoreQueryCacheInChunks(persister)

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(removeClient).toHaveBeenCalledTimes(1)
  })

  it('does nothing when there is no persisted cache', async () => {
    const { persister, removeClient } = makePersister(undefined)

    await restoreQueryCacheInChunks(persister)

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(removeClient).not.toHaveBeenCalled()
  })
})
