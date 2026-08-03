import { FIVE_MINUTES_MS } from '@alephium/shared'
import { throttledClient } from '@alephium/shared/api'
import { AddressHash } from '@alephium/shared/types'
import { ExplorerProvider } from '@alephium/web3'
import { dehydrate, InfiniteData, InfiniteQueryObserver } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { shouldDehydrateQuery } from '../src/api/persistQueryClientContext'
import {
  addressTransactionsCountQuery,
  addressTransactionsInfiniteQuery,
  addressTransactionsPageQuery,
  walletTransactionsInfiniteQuery
} from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'
import { invalidateAddressesQueries, invalidateAddressTransactions } from '../src/api/queryInvalidation'

const NETWORK_ID = 4
const MAINNET_ID = 0
const A: AddressHash = 'address-a'
const B: AddressHash = 'address-b'
const C: AddressHash = 'address-c'

const RATE_LIMITED = 'Too many requests - Status code: 429'

// The rate-limit budget is 10 retries with an exponential backoff that caps at 30s, so a persistently
// rate-limited request settles after 11 attempts and just over 3 minutes. Ten minutes leaves room for
// a wider budget to reveal itself as a higher attempt count rather than as a timeout.
const LONGER_THAN_THE_RETRY_BUDGET_MS = 10 * 60 * 1000
const ATTEMPTS_PER_RATE_LIMITED_REQUEST = 11

const tx = (hash: string) => ({ hash, blockHash: `block-of-${hash}`, timestamp: 1, inputs: [], outputs: [] })

interface WalletPageParam {
  page: number
  addressesWithMoreTxPages: AddressHash[]
}

const installExplorer = (impl: (addressHash: string, query: { page: number }) => Promise<unknown>) => {
  const getAddressesAddressTransactions = vi.fn(impl)

  vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
    addresses: {
      getAddressesAddressTransactions,
      getAddressesAddressTotalTransactions: vi.fn(async () => 1)
    }
  } as unknown as ExplorerProvider)

  return getAddressesAddressTransactions
}

const callsFor = (spy: ReturnType<typeof installExplorer>, addressHash: AddressHash) =>
  spy.mock.calls.filter(([hash]) => hash === addressHash).length

const deferred = () => {
  let resolve: () => void = () => undefined
  const promise = new Promise<void>((res) => (resolve = res))

  return { promise, resolve: () => resolve() }
}

// Exercises the composition directly. Tanstack's own retry would call this the same way, and driving
// it by hand keeps the assertions about request counts rather than about retry timing.
const fetchWalletPage = (addressHashes: AddressHash[], pageParam: WalletPageParam) => {
  const { queryFn } = walletTransactionsInfiniteQuery({ addressHashes, networkId: NETWORK_ID, isExplorerOnline: true })

  return (queryFn as (context: { pageParam: WalletPageParam }) => Promise<unknown>)({ pageParam })
}

const firstPage = { page: 1, addressesWithMoreTxPages: [] as AddressHash[] }

const pageQuery = (addressHash: AddressHash, page: number, networkId = NETWORK_ID) =>
  addressTransactionsPageQuery({ addressHash, page, networkId })

const walletQuery = (addressHashes: AddressHash[]) =>
  walletTransactionsInfiniteQuery({ addressHashes, networkId: NETWORK_ID, isExplorerOnline: true })

const addressQuery = (addressHash: AddressHash) =>
  addressTransactionsInfiniteQuery({ addressHash, networkId: NETWORK_ID, isExplorerOnline: true })

const pagesOf = (queryKey: readonly unknown[]) =>
  queryClient.getQueryData<InfiniteData<unknown, unknown>>(queryKey as unknown[])?.pages

describe('address transactions page cache', () => {
  const unsubscribes: Array<() => void> = []

  beforeEach(() => {
    queryClient.clear()
  })

  afterEach(() => {
    unsubscribes.splice(0).forEach((unsubscribe) => unsubscribe())
    vi.useRealTimers()
    vi.restoreAllMocks()
    queryClient.clear()
  })

  it('retries a rate-limited address on its own, without re-requesting the others', async () => {
    let failuresLeft = 1

    const spy = installExplorer(async (addressHash) => {
      if (addressHash === B && failuresLeft-- > 0) throw new Error(RATE_LIMITED)

      return [tx(`tx-of-${addressHash}`)]
    })

    await fetchWalletPage([A, B, C], firstPage)

    expect(callsFor(spy, B)).toBe(2)
    expect(callsFor(spy, A)).toBe(1)
    expect(callsFor(spy, C)).toBe(1)
  })

  it('re-requests only the failed address when the whole page is retried', async () => {
    let failuresLeft = 1

    const spy = installExplorer(async (addressHash) => {
      if (addressHash === B && failuresLeft-- > 0) throw new Error('Explorer unreachable')

      return [tx(`tx-of-${addressHash}`)]
    })

    await expect(fetchWalletPage([A, B, C], firstPage)).rejects.toThrow('Explorer unreachable')

    expect(spy).toHaveBeenCalledTimes(3)

    await fetchWalletPage([A, B, C], firstPage)

    expect(callsFor(spy, B)).toBe(2)
    expect(callsFor(spy, A)).toBe(1)
    expect(callsFor(spy, C)).toBe(1)
  })

  it('re-requests only the address that received a transaction', async () => {
    const spy = installExplorer(async (addressHash) => [tx(`tx-of-${addressHash}`)])

    await fetchWalletPage([A, B, C], firstPage)
    expect(spy).toHaveBeenCalledTimes(3)

    await invalidateAddressTransactions(A)
    await fetchWalletPage([A, B, C], firstPage)

    expect(callsFor(spy, A)).toBe(2)
    expect(callsFor(spy, B)).toBe(1)
    expect(callsFor(spy, C)).toBe(1)
  })

  it('invalidates every page of an address, because a new transaction shifts them all', async () => {
    const spy = installExplorer(async (addressHash) => [tx(`tx-of-${addressHash}`)])

    await queryClient.fetchQuery(pageQuery(A, 1))
    await queryClient.fetchQuery(pageQuery(A, 2))
    expect(spy).toHaveBeenCalledTimes(2)

    await invalidateAddressTransactions(A)

    await queryClient.fetchQuery(pageQuery(A, 1))
    await queryClient.fetchQuery(pageQuery(A, 2))

    expect(spy).toHaveBeenCalledTimes(4)
  })

  it('shares fetched pages between the wallet list and the address details modal', async () => {
    const spy = installExplorer(async (addressHash) => [tx(`tx-of-${addressHash}`)])

    await fetchWalletPage([A, B], firstPage)
    expect(spy).toHaveBeenCalledTimes(2)

    const { queryFn } = addressQuery(A)

    await (queryFn as (context: { pageParam: number }) => Promise<unknown>)({ pageParam: 1 })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('keeps a fetched page for as long as the session lasts, so it does not expire under the lists', async () => {
    vi.useFakeTimers()

    const spy = installExplorer(async (addressHash) => [tx(`tx-of-${addressHash}`)])

    await queryClient.fetchQuery(pageQuery(A, 1))

    await vi.advanceTimersByTimeAsync(FIVE_MINUTES_MS * 2)
    await queryClient.fetchQuery(pageQuery(A, 1))

    expect(callsFor(spy, A)).toBe(1)
  })

  describe('rate limit retry budget', () => {
    it('retries a rate-limited page ten times before giving up', async () => {
      vi.useFakeTimers()

      const spy = installExplorer(async () => {
        throw new Error(RATE_LIMITED)
      })

      const outcome = queryClient.fetchQuery(pageQuery(A, 1)).then(
        () => 'resolved',
        () => 'rejected'
      )

      await vi.advanceTimersByTimeAsync(LONGER_THAN_THE_RETRY_BUDGET_MS)

      expect(await outcome).toBe('rejected')
      expect(callsFor(spy, A)).toBe(ATTEMPTS_PER_RATE_LIMITED_REQUEST)
    })

    it('does not multiply that budget in the wallet list composed on top of it', async () => {
      vi.useFakeTimers()

      const spy = installExplorer(async () => {
        throw new Error(RATE_LIMITED)
      })

      const outcome = queryClient.fetchInfiniteQuery(walletQuery([A])).then(
        () => 'resolved',
        () => 'rejected'
      )

      await vi.advanceTimersByTimeAsync(LONGER_THAN_THE_RETRY_BUDGET_MS)

      expect(await outcome).toBe('rejected')
      expect(callsFor(spy, A)).toBe(ATTEMPTS_PER_RATE_LIMITED_REQUEST)
    })

    it('does not multiply that budget in the address details list composed on top of it', async () => {
      vi.useFakeTimers()

      const spy = installExplorer(async () => {
        throw new Error(RATE_LIMITED)
      })

      const outcome = queryClient.fetchInfiniteQuery(addressQuery(A)).then(
        () => 'resolved',
        () => 'rejected'
      )

      await vi.advanceTimersByTimeAsync(LONGER_THAN_THE_RETRY_BUDGET_MS)

      expect(await outcome).toBe('rejected')
      expect(callsFor(spy, A)).toBe(ATTEMPTS_PER_RATE_LIMITED_REQUEST)
    })
  })

  describe('refreshing the transaction lists of one address', () => {
    it('re-drives a list whose in-flight page fetch it cancels, rather than letting it land stale', async () => {
      const inFlight = deferred()
      let blockNextCall = true

      const spy = installExplorer(async () => {
        if (blockNextCall) {
          blockNextCall = false
          await inFlight.promise

          return [tx('tx-from-before-the-transaction')]
        }

        return [tx('tx-from-after-the-transaction')]
      })

      const observer = new InfiniteQueryObserver(queryClient, walletQuery([A]) as never)
      unsubscribes.push(observer.subscribe(() => {}))
      await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

      const invalidation = invalidateAddressTransactions(A)
      inFlight.resolve()
      await invalidation

      await vi.waitFor(() => expect(observer.getCurrentResult().isFetching).toBe(false))

      const pages = observer.getCurrentResult().data?.pages as Array<{ pageTransactions: Array<{ hash: string }> }>

      expect(pages).toHaveLength(1)
      expect(pages[0].pageTransactions.map(({ hash }) => hash)).toEqual(['tx-from-after-the-transaction'])
      expect(callsFor(spy, A)).toBe(2)
    })

    it('truncates each wallet list from its own pages rather than from the first match', async () => {
      const walletPage = (marker: string) => ({ pageTransactions: [tx(marker)], addressesWithMoreTxPages: [] })

      queryClient.setQueryData<InfiniteData<unknown, unknown>>(walletQuery([A]).queryKey, {
        pages: [walletPage('a-1'), walletPage('a-2')],
        pageParams: [{ page: 1 }, { page: 2 }]
      })
      queryClient.setQueryData<InfiniteData<unknown, unknown>>(walletQuery([B]).queryKey, {
        pages: [walletPage('b-1'), walletPage('b-2'), walletPage('b-3')],
        pageParams: [{ page: 1 }, { page: 2 }, { page: 3 }]
      })

      await invalidateAddressTransactions(A)

      expect(pagesOf(walletQuery([A]).queryKey)).toEqual([walletPage('a-1')])
      expect(pagesOf(walletQuery([B]).queryKey)).toEqual([walletPage('b-1')])
    })
  })

  describe('refreshing balances while a transaction list is loading', () => {
    it('does not strand the wallet list', async () => {
      const inFlight = deferred()
      const spy = installExplorer(async (addressHash) => {
        await inFlight.promise

        return [tx(`tx-of-${addressHash}`)]
      })

      const list = queryClient.fetchInfiniteQuery(walletQuery([A]))
      await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

      await invalidateAddressesQueries(new Set([A]))
      inFlight.resolve()

      expect((await list).pages).toHaveLength(1)
      expect(callsFor(spy, A)).toBe(1)
    })

    it('does not strand the address details list', async () => {
      const inFlight = deferred()
      const spy = installExplorer(async (addressHash) => {
        await inFlight.promise

        return [tx(`tx-of-${addressHash}`)]
      })

      const list = queryClient.fetchInfiniteQuery(addressQuery(A))
      await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

      await invalidateAddressesQueries(new Set([A]))
      inFlight.resolve()

      expect((await list).pages).toHaveLength(1)
      expect(callsFor(spy, A)).toBe(1)
    })
  })

  describe('persistence', () => {
    it('keeps the page cache out of the persisted payload', async () => {
      installExplorer(async (addressHash) => [tx(`tx-of-${addressHash}`)])

      await queryClient.fetchQuery(pageQuery(A, 1, MAINNET_ID))

      expect(dehydrate(queryClient, { shouldDehydrateQuery }).queries).toHaveLength(0)
    })

    it('still persists the transactions count query, whose key starts the same way', async () => {
      installExplorer(async (addressHash) => [tx(`tx-of-${addressHash}`)])

      await queryClient.fetchQuery(
        addressTransactionsCountQuery({ addressHash: A, networkId: MAINNET_ID, isExplorerOnline: true })
      )

      expect(dehydrate(queryClient, { shouldDehydrateQuery }).queries).toHaveLength(1)
    })
  })
})
