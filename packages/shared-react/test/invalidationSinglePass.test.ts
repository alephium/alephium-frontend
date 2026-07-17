import { AddressHash } from '@alephium/shared/types'
import { CancelledError } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

// The proposed replacement for the ordered cascade: one invalidateQueries call covering all levels at once
const invalidateAddressQueriesSinglePass = (addressHash: AddressHash) =>
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === 'address' &&
      query.queryKey[1] === addressHash &&
      typeof query.queryKey[2] === 'string' &&
      query.queryKey[2].startsWith('level:')
  })

let mockExplorer: MockExplorer

beforeEach(() => {
  mockExplorer = installMockExplorer()
})

afterEach(async () => {
  await cleanUpQueryClient()
  vi.restoreAllMocks()
})

describe('single-pass invalidation when dependencies entered the cache before their consumers', () => {
  it('converges like the cascade: refetches initiated bottom-up deduplicate into fresh results', async () => {
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

describe('single-pass invalidation when a consumer entered the cache before its dependencies', () => {
  // Derived queries create their dependency cache entries lazily via fetchQuery inside their queryFns, so whenever a
  // derived hook mounts before any component observes level 0 directly, the consumer precedes its dependencies in the
  // query cache. refetchQueries walks the cache in insertion order, so it starts the consumer's refetch first. The
  // consumer's queryFn synchronously starts its dependency's fetch through fetchQuery, and when refetchQueries then
  // reaches the dependency itself, cancelRefetch (default true) silently cancels that exact in-flight fetch out from
  // under the consumer. The consumer's queryFn rejects with a silent CancelledError and never recovers.
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

  it('is healed by the ordered cascade, which refetches each level only after its dependencies completed', async () => {
    await seedConsumersFirst(balancesAllQuery())

    observe(balancesAllQuery())
    observe(alphBalanceQuery())

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueriesSinglePass(ADDRESS_HASH)

    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('1000')

    await invalidateAddressQueries(ADDRESS_HASH)

    const consumerState = getState(balancesAllQuery())
    expect(getAlphTotalBalanceMarker(consumerState.data)).toBe('2000')
    expect(consumerState.isInvalidated).toBe(false)
    expect(consumerState.fetchStatus).toBe('idle')
  })

  it('does not diverge from the cascade in this order: the ordered cascade recomputes everything correctly', async () => {
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

describe('shared semantics of both variants', () => {
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

  it('retries a flaky level-0 fetch under the single pass exactly like under the cascade', async () => {
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

  it('serves pre-invalidation data when a dependency fetch was already in flight, under both variants', async () => {
    await seedDependenciesFirst()

    let resolveInFlightFetch: (value: { balance: string; lockedBalance: string }) => void = () => undefined
    mockExplorer.mocks.alphBalance.mockImplementationOnce(
      () => new Promise((resolve) => (resolveInFlightFetch = resolve))
    )

    const inFlightFetch = queryClient.fetchQuery({ ...alphBalanceQuery(), staleTime: 0 })

    bumpServerBalance(mockExplorer, '2000')
    await invalidateAddressQueries(ADDRESS_HASH)

    expect(getState(alphBalanceQuery()).isInvalidated).toBe(true)

    resolveInFlightFetch({ balance: '1000', lockedBalance: '0' })
    await inFlightFetch

    // The success of the pre-invalidation fetch clears the invalidation flag with pre-invalidation data
    expect(getState(alphBalanceQuery()).isInvalidated).toBe(false)

    const result = await queryClient.fetchQuery(balancesAllQuery())

    expect(getAlphTotalBalanceMarker(result)).toBe('1000')
  })
})
