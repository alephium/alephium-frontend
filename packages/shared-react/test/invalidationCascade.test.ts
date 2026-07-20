import { InfiniteData, InfiniteQueryObserver } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { walletTransactionsInfiniteQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'
import { invalidateWalletQueries } from '../src/api/queryInvalidation'
import {
  ADDRESS_HASH,
  alphBalanceQuery,
  balancesAllQuery,
  balancesByListingQuery,
  bumpServerBalance,
  cleanUpQueryClient,
  confirmedTx,
  detectNewTxThroughGate,
  ftsQuery,
  getAlphL0BalanceMarker,
  getAlphTotalBalanceMarker,
  getListedFtsMarker,
  getState,
  installMockExplorer,
  MockExplorer,
  NETWORK_ID,
  observe,
  seedConsumersFirst,
  seedDependenciesFirst,
  seedGate,
  tokensBalanceQuery,
  tokensByTypeQuery,
  trackFetchStarts,
  trackSubscription,
  txCountQuery
} from './invalidationTestHarness'

let mockExplorer: MockExplorer

beforeEach(() => {
  mockExplorer = installMockExplorer()
})

afterEach(async () => {
  await cleanUpQueryClient()
  vi.restoreAllMocks()
})

describe('invalidation cascade on new tx detection', () => {
  it('refetches every active level exactly once and recomputes derived levels from fresh dependencies', async () => {
    await seedGate()
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

    const fetchStarts = trackFetchStarts()

    bumpServerBalance(mockExplorer, '2000')
    await detectNewTxThroughGate(mockExplorer, 'tx-2')

    for (const query of observedQueries) {
      expect(fetchStarts.of(query), `fetch starts of ${JSON.stringify(query.queryKey)}`).toBe(1)
      expect(getState(query).isInvalidated).toBe(false)
      expect(getState(query).status).toBe('success')
    }

    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(2)
    expect(mockExplorer.mocks.tokensBalance).toHaveBeenCalledTimes(2)
    expect(mockExplorer.mocks.txCount).toHaveBeenCalledTimes(2)

    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')
    expect(getListedFtsMarker(getState(balancesByListingQuery()).data)).toBe('2000')
    expect(getListedFtsMarker(getState(tokensByTypeQuery()).data)).toBe('2000')
    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
  })

  it('only marks inactive levels invalidated, and the next mount recomputes them from fresh dependencies bottom-up', async () => {
    await seedGate()
    await seedDependenciesFirst()

    const derivedQueries = [balancesAllQuery(), balancesByListingQuery(), tokensByTypeQuery(), ftsQuery()]

    bumpServerBalance(mockExplorer, '2000')
    await detectNewTxThroughGate(mockExplorer, 'tx-2')

    for (const query of [alphBalanceQuery(), tokensBalanceQuery(), txCountQuery(), ...derivedQueries]) {
      expect(getState(query).isInvalidated).toBe(true)
      expect(getState(query).dataUpdateCount).toBe(1)
    }
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('1000')
    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(1)

    const observer = observe(ftsQuery())
    await vi.waitFor(() => expect(observer.getCurrentResult().isFetching).toBe(false))

    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
    for (const query of derivedQueries) {
      expect(getState(query).isInvalidated).toBe(false)
      expect(getState(query).dataUpdateCount).toBe(2)
    }
    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(2)
    expect(mockExplorer.mocks.tokensBalance).toHaveBeenCalledTimes(2)

    // Nothing consumes the tx count query, so it stays invalidated until its own next mount
    expect(getState(txCountQuery()).isInvalidated).toBe(true)
  })

  it('recomputes an active derived level from fresh data even when the intermediate levels are inactive', async () => {
    await seedGate()
    await seedDependenciesFirst()

    observe(alphBalanceQuery())
    observe(tokensByTypeQuery())

    const fetchStarts = trackFetchStarts()

    bumpServerBalance(mockExplorer, '2000')
    await detectNewTxThroughGate(mockExplorer, 'tx-2')

    expect(getListedFtsMarker(getState(tokensByTypeQuery()).data)).toBe('2000')
    expect(fetchStarts.of(tokensByTypeQuery())).toBe(1)

    for (const query of [balancesAllQuery(), balancesByListingQuery()]) {
      expect(getState(query).isInvalidated).toBe(false)
      expect(getState(query).dataUpdateCount).toBe(2)
      expect(fetchStarts.of(query)).toBe(1)
    }
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')

    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(2)
    expect(mockExplorer.mocks.tokensBalance).toHaveBeenCalledTimes(2)
    expect(fetchStarts.of(alphBalanceQuery())).toBe(1)
  })

  // Derived queries create their dependency cache entries lazily via fetchQuery inside their queryFns, so consumers
  // often precede their dependencies in the query cache. The per-level ordering keeps the cascade correct regardless
  // of cache insertion order; see invalidationSinglePass.test.ts for how an unordered pass breaks in this setup.
  it('recomputes correctly even when consumers entered the cache before their dependencies', async () => {
    await seedGate()
    await seedConsumersFirst(ftsQuery())

    observe(ftsQuery())
    observe(alphBalanceQuery())

    bumpServerBalance(mockExplorer, '2000')
    await detectNewTxThroughGate(mockExplorer, 'tx-2')

    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
    expect(getState(ftsQuery()).isInvalidated).toBe(false)
    expect(getState(ftsQuery()).fetchStatus).toBe('idle')
    expect(getAlphL0BalanceMarker(getState(alphBalanceQuery()).data)).toBe('2000')
  })

  it('retries a flaky level-0 fetch during the cascade and still recomputes derived levels from the fresh result', async () => {
    await seedGate()
    await seedDependenciesFirst()

    const observedQueries = [alphBalanceQuery(), ftsQuery()]
    observedQueries.forEach(observe)

    bumpServerBalance(mockExplorer, '2000')
    mockExplorer.mocks.alphBalance.mockRejectedValueOnce(new Error('Too many requests - Status code: 429'))

    await detectNewTxThroughGate(mockExplorer, 'tx-2')

    expect(getState(alphBalanceQuery()).status).toBe('success')
    expect(getAlphTotalBalanceMarker(getState(balancesAllQuery()).data)).toBe('2000')
    expect(getListedFtsMarker(getState(ftsQuery()).data)).toBe('2000')
    expect(mockExplorer.mocks.alphBalance).toHaveBeenCalledTimes(3)
  })
})

describe('gate first-data skip', () => {
  it('does not fire the cascade when neither the gate cache nor the ALPH balance data exists', async () => {
    queryClient.setQueryData(balancesAllQuery().queryKey, {
      addressHash: ADDRESS_HASH,
      balances: []
    })

    await seedGate()

    expect(getState(balancesAllQuery()).isInvalidated).toBe(false)

    await detectNewTxThroughGate(mockExplorer, 'tx-2')

    expect(getState(balancesAllQuery()).isInvalidated).toBe(true)
  })

  it('fires the cascade on the first gate data when ALPH balance data already exists', async () => {
    await queryClient.fetchQuery(alphBalanceQuery())

    expect(getState(alphBalanceQuery()).isInvalidated).toBe(false)

    await seedGate()

    expect(getState(alphBalanceQuery()).isInvalidated).toBe(true)
  })
})

describe('invalidateWalletQueries', () => {
  const walletQuery = () =>
    walletTransactionsInfiniteQuery({ addressHashes: [ADDRESS_HASH], networkId: NETWORK_ID, isExplorerOnline: true })

  const seedThreePagesOnServer = () => {
    mockExplorer.state.transactionsByPage = {
      1: [confirmedTx('tx-page-1')],
      2: [confirmedTx('tx-page-2')],
      3: [confirmedTx('tx-page-3')]
    }
  }

  it('trims the cached pages to the first one before invalidating', async () => {
    seedThreePagesOnServer()
    await queryClient.fetchInfiniteQuery({ ...walletQuery(), pages: 3 })

    const stateBefore = getState(walletQuery())
    expect((stateBefore.data as InfiniteData<unknown>).pages).toHaveLength(3)

    const transactionsCallsBefore = mockExplorer.mocks.transactions.mock.calls.length

    await invalidateWalletQueries()

    const stateAfter = getState(walletQuery())
    expect((stateAfter.data as InfiniteData<unknown>).pages).toHaveLength(1)
    expect((stateAfter.data as InfiniteData<unknown>).pageParams).toHaveLength(1)
    expect(stateAfter.isInvalidated).toBe(true)
    expect(mockExplorer.mocks.transactions.mock.calls.length).toBe(transactionsCallsBefore)
  })

  it('refetches only the first page for an active observer, not every loaded page', async () => {
    seedThreePagesOnServer()

    const observer = new InfiniteQueryObserver(queryClient, walletQuery())
    trackSubscription(observer.subscribe(() => {}))
    await vi.waitFor(() => expect(observer.getCurrentResult().isFetching).toBe(false))
    await observer.fetchNextPage()
    await observer.fetchNextPage()

    expect((getState(walletQuery()).data as InfiniteData<unknown>).pages).toHaveLength(3)

    mockExplorer.state.transactionsByPage = { ...mockExplorer.state.transactionsByPage, 1: [confirmedTx('tx-new')] }
    const transactionsCallsBefore = mockExplorer.mocks.transactions.mock.calls.length

    await invalidateWalletQueries()

    expect(mockExplorer.mocks.transactions.mock.calls.length).toBe(transactionsCallsBefore + 1)

    const data = getState(walletQuery()).data as InfiniteData<{ pageTransactions: Array<{ hash: string }> }>
    expect(data.pages).toHaveLength(1)
    expect(data.pages[0].pageTransactions.map(({ hash }) => hash)).toEqual(['tx-new'])
    expect(getState(walletQuery()).isInvalidated).toBe(false)
  })
})
