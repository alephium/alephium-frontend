import { AddressHash } from '@alephium/shared/types'
import { CancelledError } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ADDRESS_DATA } from '../src/api/queries/addressQueries'
import { queryClient } from '../src/api/queryClient'
import { invalidateAddressQueries } from '../src/api/queryInvalidation'
import {
  ADDRESS_HASH,
  alphBalanceQuery,
  balancesAllQuery,
  balancesByListingQuery,
  bumpServerBalance,
  cleanUpQueryClient,
  ftsQuery,
  getAlphL0BalanceMarker,
  getAlphTotalBalanceMarker,
  getListedFtsMarker,
  getState,
  installMockExplorer,
  MockExplorer,
  observe,
  seedConsumersFirst,
  seedDependenciesFirst,
  tokensBalanceQuery,
  tokensByTypeQuery,
  txCountQuery
} from './invalidationTestHarness'

// This file is a guard rail. It reproduces the two naive alternatives to the cancel-then-invalidate pass in
// invalidateAddressQueries so that anyone tempted to "simplify" the real code back into one of them meets a red test
// explaining why it was rejected.

// Rejected alternative 1: a single invalidateQueries pass over all levels with the default cancelRefetch:true
const invalidateAddressQueriesSinglePass = (addressHash: AddressHash) =>
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === 'address' && query.queryKey[1] === addressHash && query.queryKey[2] === ADDRESS_DATA
  })

// Rejected alternative 2: the same pass with cancelRefetch:false but no cancelQueries beforehand
const invalidateSinglePassNoCancel = (addressHash: AddressHash) =>
  queryClient.invalidateQueries(
    {
      predicate: (query) =>
        query.queryKey[0] === 'address' && query.queryKey[1] === addressHash && query.queryKey[2] === ADDRESS_DATA
    },
    { cancelRefetch: false }
  )

const flush = async (times = 6) => {
  for (let i = 0; i < times; i++) await new Promise((resolve) => setTimeout(resolve, 0))
}

let mockExplorer: MockExplorer

beforeEach(() => {
  mockExplorer = installMockExplorer()
})

afterEach(async () => {
  await cleanUpQueryClient()
  vi.restoreAllMocks()
})

describe('default single pass (cancelRefetch:true) when dependencies entered the cache before their consumers', () => {
  it('converges: refetches initiated bottom-up deduplicate into fresh results', async () => {
    await seedDependenciesFirst()

    const observedQueries = [
      alphBalanceQuery(),
      tokensBalanceQuery(),
      txCountQuery(),
      balancesAllQuery(),
      balancesByListingQuery(),
      tokensByTypeQuery(),
      ftsQuery()
    ]
    observedQueries.forEach(observe)

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueriesSinglePass(ADDRESS_HASH)

    for (const query of observedQueries) {
      expect(getState(query).isInvalidated).toBe(false)
      expect(getState(query).status).toBe('success')
    }
    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(2)
    expect(mockExplorer.mocks.tokensBalance).toHaveBeenCalledTimes(2)
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')
    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
  })
})

describe('default single pass (cancelRefetch:true) when a consumer entered the cache before its dependencies', () => {
  // Derived queries create their dependency cache entries lazily via fetchQuery inside their queryFns, so whenever a
  // derived hook mounts before any component observes level 0 directly, the consumer precedes its dependencies in the
  // query cache. invalidateQueries walks the cache in insertion order, so it starts the consumer's refetch first. The
  // consumer's queryFn synchronously starts its dependency's fetch through fetchQuery, and when the pass then reaches
  // the dependency itself, cancelRefetch (default true) silently cancels that exact in-flight fetch out from under the
  // consumer. The consumer's queryFn rejects with a silent CancelledError and never recovers.
  it('leaves the consumer with stale data, still marked invalidated, and a poisoned fetch promise', async () => {
    await seedConsumersFirst(balancesAllQuery())

    observe(balancesAllQuery())
    observe(alphBalanceQuery())

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueriesSinglePass(ADDRESS_HASH)

    expect(getAlphL0BalanceMarker(getState(alphBalanceQuery()).data)).toBe('2000')
    expect(getState(alphBalanceQuery()).isInvalidated).toBe(false)

    const consumerState = getState(balancesAllQuery())
    expect(getAlphTotalBalanceMarker(consumerState.data)).toBe('1000')
    expect(consumerState.isInvalidated).toBe(true)
    expect(consumerState.fetchStatus).toBe('fetching')

    // The CancelledError is silent, so the failure surfaces neither as an error state nor through observers
    expect(consumerState.status).toBe('success')
    expect(consumerState.error).toBeNull()

    // The consumer's queryFn was aborted before it could pull its second dependency
    expect(getState(tokensBalanceQuery()).isInvalidated).toBe(true)
    expect(getState(tokensBalanceQuery()).dataUpdateCount).toBe(1)

    // The rejected retryer promise is returned to any subsequent fetchQuery, so even manual fetching cannot recover
    await expect(queryClient.fetchQuery(balancesAllQuery())).rejects.toThrow(CancelledError)
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('1000')
  })

  it('cancels the whole dependency chain when the consumer is at the top and intermediates are inactive', async () => {
    await seedConsumersFirst(ftsQuery())

    observe(ftsQuery())
    observe(alphBalanceQuery())

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueriesSinglePass(ADDRESS_HASH)

    expect(getState(alphBalanceQuery()).isInvalidated).toBe(false)

    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('1000')
    expect(getState(ftsQuery()).isInvalidated).toBe(true)

    for (const query of [tokensByTypeQuery(), balancesByListingQuery(), balancesAllQuery()]) {
      expect(getState(query).isInvalidated).toBe(true)
      expect(getState(query).dataUpdateCount).toBe(1)
    }
  })

  it('is avoided by the real invalidateAddressQueries, which recomputes everything correctly in this same order', async () => {
    await seedConsumersFirst(ftsQuery())

    observe(ftsQuery())
    observe(alphBalanceQuery())

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueries(ADDRESS_HASH)

    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
    expect(getState(ftsQuery()).isInvalidated).toBe(false)
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')
    expect(getState(alphBalanceQuery()).isInvalidated).toBe(false)
  })
})

describe('shared semantics of the single pass', () => {
  it('fetchQuery refetches an invalidated inactive dependency despite staleTime Infinity', async () => {
    await seedDependenciesFirst()

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueriesSinglePass(ADDRESS_HASH)

    for (const query of [alphBalanceQuery(), balancesAllQuery(), ftsQuery()]) {
      expect(getState(query).isInvalidated).toBe(true)
      expect(getState(query).dataUpdateCount).toBe(1)
    }

    const result = await queryClient.fetchQuery(ftsQuery())

    expect(getListedFtsMarker(result)).toBe('2000')
    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(2)
    expect(getState(balancesAllQuery()).isInvalidated).toBe(false)
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')
  })

  it('retries a flaky level-0 fetch under the single pass exactly like the real invalidation', async () => {
    await seedDependenciesFirst()

    const observedQueries = [alphBalanceQuery(), tokensBalanceQuery(), balancesAllQuery(), ftsQuery()]
    observedQueries.forEach(observe)

    bumpServerBalance(mockExplorer, '2000')
    mockExplorer.mocks.alphBalance.mockRejectedValueOnce(new Error('Too many requests - Status code: 429'))

    await invalidateAddressQueriesSinglePass(ADDRESS_HASH)

    expect(getState(alphBalanceQuery()).status).toBe('success')
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')
    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(3)
  })
})

// A balance fetch is already in flight on an ACTIVE level-0 query when a new transaction fires the invalidation.
// That in-flight fetch was issued before the change, so it will resolve with pre-change data. This is the one place
// where cancelRefetch's two values do different things: true cancels and restarts the fetch, false lets it finish.
const runInFlightSupersededScenario = async (invalidate: (addressHash: AddressHash) => Promise<void>) => {
  await seedDependenciesFirst()
  observe(alphBalanceQuery())
  observe(balancesAllQuery())

  let resolveInFlight: (value: { balance: string; lockedBalance: string }) => void = () => undefined
  mockExplorer.mocks.alphBalance.mockImplementationOnce(() => new Promise((resolve) => (resolveInFlight = resolve)))
  const inFlight = queryClient.fetchQuery({ ...alphBalanceQuery(), staleTime: 0 }).catch(() => undefined)
  await flush()

  bumpServerBalance(mockExplorer, '2000')

  const invalidation = invalidate(ADDRESS_HASH)
  await flush()

  resolveInFlight({ balance: '1000', lockedBalance: '0' })
  await invalidation
  await inFlight
  await flush()

  return {
    alph: getAlphL0BalanceMarker(getState(alphBalanceQuery()).data),
    balancesAll: getAlphTotalBalanceMarker(getState(balancesAllQuery()).data),
    alphInvalidated: getState(alphBalanceQuery()).isInvalidated,
    alphServerCalls: mockExplorer.mocks.alphBalance.mock.calls.length
  }
}

describe('why plain cancelRefetch:false is not enough, and why we cancel first', () => {
  it('CANCEL-FIRST (real invalidateAddressQueries): cancels the superseded fetch and converges to the fresh balance', async () => {
    const result = await runInFlightSupersededScenario(invalidateAddressQueries)

    expect(result.alph).toBe('2000')
    expect(result.balancesAll).toBe('2000')
    expect(result.alphInvalidated).toBe(false)
  })

  it('SINGLE PASS (cancelRefetch:false): keeps the stale in-flight result, and it sticks under staleTime Infinity', async () => {
    const result = await runInFlightSupersededScenario(invalidateSinglePassNoCancel)

    expect(result.alph).toBe('1000')
    expect(result.balancesAll).toBe('1000')

    // The stale fetch cleared the invalidation flag, so nothing will refetch this on its own
    expect(result.alphInvalidated).toBe(false)

    // A later consumer mount reads the same stale value, confirming the staleness is persistent, not transient
    const fts = await queryClient.fetchQuery(ftsQuery())
    expect(getListedFtsMarker(fts)).toBe('1000')
  })
})
