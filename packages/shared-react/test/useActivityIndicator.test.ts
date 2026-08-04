// @vitest-environment happy-dom

import { batchers, throttledClient } from '@alephium/shared/api'
import { AddressHash } from '@alephium/shared/types'
import { ExplorerProvider } from '@alephium/web3'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchWalletTransactionsInfinite } from '../src/api/apiDataHooks/wallet/useFetchWalletTransactionsInfinite'
import { queryClient } from '../src/api/queryClient'
import { useActivityIndicator } from '../src/hooks/useActivityIndicator'

const NETWORK_ID = 4
const A: AddressHash = 'address-a'
const B: AddressHash = 'address-b'

vi.mock('../src/network/networkHooks', () => ({
  useNetworkId: () => NETWORK_ID,
  useIsExplorerOnline: () => true
}))

vi.mock('../src/hooks/addresses/useUnsortedAddresses', () => ({
  useUnsortedAddressesHashes: () => [A, B]
}))

const tx = (hash: string, timestamp: number) => ({
  hash,
  blockHash: `block-of-${hash}`,
  timestamp,
  inputs: [],
  outputs: []
})

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children)

const installExplorer = (state: { txsByAddress: Record<AddressHash, ReturnType<typeof tx>[]> }) => {
  vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
    addresses: {
      getAddressesAddressTransactions: vi.fn(async (addressHash: AddressHash, { page }: { page: number }) =>
        page === 1 ? state.txsByAddress[addressHash] ?? [] : []
      ),
      postAddressesLatestTransactions: vi.fn(async (addressHashes: AddressHash[]) =>
        addressHashes
          .map((address) => ({ address, transactionInfo: state.txsByAddress[address]?.[0] }))
          .filter(({ transactionInfo }) => transactionInfo !== undefined)
      )
    }
  } as unknown as ExplorerProvider)
  batchers.init()
}

const pollLatestTransactionOf = (addressHash: AddressHash) =>
  act(() => queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] }))

const polledLatestTxOf = (addressHash: AddressHash) =>
  queryClient.getQueriesData({ queryKey: ['address', addressHash, 'transaction', 'latest'] })[0]?.[1]

const waitUntilTheBadgeHasSeenTheWallet = () =>
  waitFor(() => {
    expect(polledLatestTxOf(A)).toBeDefined()
    expect(polledLatestTxOf(B)).toBeDefined()
  })

describe('useActivityIndicator', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  // The transaction list no longer refetches on its own when a transaction arrives, so the badge cannot be derived
  // from its rows alone or it would never leave zero for a user sitting on any other page.
  it('counts a transaction the poll found while the list was left untouched', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    installExplorer(state)

    const { result } = renderHook(() => useActivityIndicator({ isDisabled: false }), { wrapper })

    await waitUntilTheBadgeHasSeenTheWallet()
    expect(result.current).toBe(0)

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await pollLatestTransactionOf(A)

    await waitFor(() => expect(result.current).toBe(1))
  })

  it('accumulates across addresses', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    installExplorer(state)

    const { result } = renderHook(() => useActivityIndicator({ isDisabled: false }), { wrapper })

    await waitUntilTheBadgeHasSeenTheWallet()
    expect(result.current).toBe(0)

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await pollLatestTransactionOf(A)
    await waitFor(() => expect(result.current).toBe(1))

    state.txsByAddress[B] = [tx('b-new', 4), tx('b-old', 2)]
    await pollLatestTransactionOf(B)
    await waitFor(() => expect(result.current).toBe(2))
  })

  // Zero is also the value before the poll has been processed at all, so a second instance that does count is rendered
  // alongside as the barrier: reading 1 from it proves both instances have already seen the same poll.
  it('stays at zero while the user is on the page the badge points at', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    installExplorer(state)

    const { result } = renderHook(
      () => ({
        onTheActivityPage: useActivityIndicator({ isDisabled: true }),
        elsewhere: useActivityIndicator({ isDisabled: false })
      }),
      { wrapper }
    )

    await waitUntilTheBadgeHasSeenTheWallet()

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await pollLatestTransactionOf(A)

    await waitFor(() => expect(result.current.elsewhere).toBe(1))
    expect(result.current.onTheActivityPage).toBe(0)
  })

  it('does not report the transactions it ignored once the user leaves that page', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    installExplorer(state)

    const { result, rerender } = renderHook(
      ({ isDisabled }: { isDisabled: boolean }) => ({
        badge: useActivityIndicator({ isDisabled }),
        barrier: useActivityIndicator({ isDisabled: false })
      }),
      { wrapper, initialProps: { isDisabled: true } }
    )

    await waitUntilTheBadgeHasSeenTheWallet()

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await pollLatestTransactionOf(A)
    await waitFor(() => expect(result.current.barrier).toBe(1))

    rerender({ isDisabled: false })

    state.txsByAddress[B] = [tx('b-new', 4), tx('b-old', 2)]
    await pollLatestTransactionOf(B)

    await waitFor(() => expect(result.current.badge).toBe(1))
    expect(result.current.barrier).toBe(2)
  })

  // A list that could not load and then can is not a burst of arrivals, it is the same history becoming readable
  describe('when the transaction list itself cannot load', () => {
    const installExplorerWithUnreachablePages = (state: {
      txsByAddress: Record<AddressHash, ReturnType<typeof tx>[]>
      pagesUnreachable: boolean
    }) => {
      vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
        addresses: {
          getAddressesAddressTransactions: vi.fn(async (addressHash: AddressHash, { page }: { page: number }) => {
            if (state.pagesUnreachable) throw new Error('Explorer unreachable')

            return page === 1 ? state.txsByAddress[addressHash] ?? [] : []
          }),
          postAddressesLatestTransactions: vi.fn(async (addressHashes: AddressHash[]) =>
            addressHashes
              .map((address) => ({ address, transactionInfo: state.txsByAddress[address]?.[0] }))
              .filter(({ transactionInfo }) => transactionInfo !== undefined)
          )
        }
      } as unknown as ExplorerProvider)
      batchers.init()
    }

    const history = (prefix: string) => Array.from({ length: 20 }, (_, i) => tx(`${prefix}-${i}`, 100 - i))

    it('still counts what the poll finds', async () => {
      const state = { txsByAddress: { [A]: history('a'), [B]: history('b') }, pagesUnreachable: true }
      installExplorerWithUnreachablePages(state)

      const { result } = renderHook(() => useActivityIndicator({ isDisabled: false }), { wrapper })

      await waitUntilTheBadgeHasSeenTheWallet()

      state.txsByAddress[A] = [tx('a-new', 200), ...history('a')]
      await pollLatestTransactionOf(A)

      await waitFor(() => expect(result.current).toBe(1))
    })

    it('does not report the history as arrivals once it loads again', async () => {
      const state = { txsByAddress: { [A]: history('a'), [B]: history('b') }, pagesUnreachable: true }
      installExplorerWithUnreachablePages(state)

      const { result } = renderHook(
        () => ({
          badge: useActivityIndicator({ isDisabled: false }),
          walletList: useFetchWalletTransactionsInfinite()
        }),
        { wrapper }
      )

      await waitUntilTheBadgeHasSeenTheWallet()
      await waitFor(() => expect(result.current.walletList.isLoading).toBe(false))
      expect(result.current.walletList.data).toEqual([])

      state.pagesUnreachable = false
      await act(() => queryClient.refetchQueries({ queryKey: ['wallet', 'transactions'] }))

      await waitFor(() => expect(result.current.walletList.data).toHaveLength(40))
      expect(result.current.badge).toBe(0)
    })
  })
})
