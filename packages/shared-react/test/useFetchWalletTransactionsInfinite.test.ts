// @vitest-environment happy-dom

import { batchers, throttledClient } from '@alephium/shared/api'
import { AddressHash } from '@alephium/shared/types'
import { ExplorerProvider } from '@alephium/web3'
import { InfiniteData, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  refreshWalletTransactionsFromCache,
  useFetchWalletTransactionsInfinite
} from '../src/api/apiDataHooks/wallet/useFetchWalletTransactionsInfinite'
import { walletTransactionsInfiniteQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'

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

// The rendered hook lags a cache write that happens outside a render pass, so page counts are read from the cache
const cachedWalletListPageCount = () =>
  queryClient.getQueryData<InfiniteData<unknown, unknown>>(
    walletTransactionsInfiniteQuery({ addressHashes: [A, B], networkId: NETWORK_ID, isExplorerOnline: true }).queryKey
  )?.pages.length

const installExplorer = (state: {
  txsByAddress: Record<AddressHash, ReturnType<typeof tx>[]>
  pagesUnreachable?: boolean
}) => {
  const getAddressesAddressTransactions = vi.fn(async (addressHash: AddressHash, { page }: { page: number }) => {
    if (state.pagesUnreachable) throw new Error('Explorer unreachable')

    return page === 1 ? state.txsByAddress[addressHash] ?? [] : []
  })

  const postAddressesLatestTransactions = vi.fn(async (addressHashes: AddressHash[]) =>
    addressHashes
      .map((address) => ({ address, transactionInfo: state.txsByAddress[address]?.[0] }))
      .filter(({ transactionInfo }) => transactionInfo !== undefined)
  )

  vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
    addresses: { getAddressesAddressTransactions, postAddressesLatestTransactions }
  } as unknown as ExplorerProvider)
  batchers.init()

  return { getAddressesAddressTransactions }
}

describe('useFetchWalletTransactionsInfinite', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  it('keeps the rows the user is reading when a transaction arrives, and offers them behind the button', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    const { getAddressesAddressTransactions } = installExplorer(state)

    const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data.map(({ hash }) => hash)).toEqual(['a-old', 'b-old'])
    expect(result.current.showNewTxsMessage).toBe(false)

    const requestsBefore = getAddressesAddressTransactions.mock.calls.length

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await act(() => queryClient.refetchQueries({ queryKey: ['address', A, 'transaction', 'latest'] }))

    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(true))
    expect(result.current.data.map(({ hash }) => hash)).toEqual(['a-old', 'b-old'])
    expect(getAddressesAddressTransactions.mock.calls.length).toBe(requestsBefore)

    await act(() => result.current.refresh())
    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(false))

    expect(result.current.data.map(({ hash }) => hash)).toEqual(['a-new', 'a-old', 'b-old'])
  })

  it('re-requests only the address that received the transaction when the button is clicked', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    const { getAddressesAddressTransactions } = installExplorer(state)

    const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsFor = (addressHash: AddressHash) =>
      getAddressesAddressTransactions.mock.calls.filter(([hash]) => hash === addressHash).length

    const callsForBBefore = callsFor(B)

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await act(() => queryClient.refetchQueries({ queryKey: ['address', A, 'transaction', 'latest'] }))
    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(true))

    const callsForABefore = callsFor(A)

    await act(() => result.current.refresh())
    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(false))

    expect(callsFor(A)).toBe(callsForABefore + 1)
    expect(callsFor(B)).toBe(callsForBBefore)
  })

  it('offers a transaction that is older than another address’s newest one', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-newest', 10)] } }
    installExplorer(state)

    const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.showNewTxsMessage).toBe(false)

    state.txsByAddress[A] = [tx('a-new', 5), tx('a-old', 1)]
    await act(() => queryClient.refetchQueries({ queryKey: ['address', A, 'transaction', 'latest'] }))

    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(true))

    await act(() => result.current.refresh())
    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(false))

    expect(result.current.data.map(({ hash }) => hash)).toEqual(['a-new', 'a-old', 'b-newest'])
  })

  it('drops the pages below the first when the button is clicked, so the wallet does not rebuild them', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
    installExplorer(state)

    const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.fetchNextPage().then(() => undefined))
    await waitFor(() => expect(result.current.pagesLoaded).toBe(2))

    state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
    await act(() => queryClient.refetchQueries({ queryKey: ['address', A, 'transaction', 'latest'] }))
    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(true))

    expect(result.current.pagesLoaded).toBe(2)

    await act(() => result.current.refresh())
    await waitFor(() => expect(result.current.showNewTxsMessage).toBe(false))

    expect(result.current.pagesLoaded).toBe(1)
  })

  it('offers nothing while the list itself has never loaded, even though the poll has', async () => {
    const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] }, pagesUnreachable: true }
    installExplorer(state)

    const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual([])
    expect(result.current.showNewTxsMessage).toBe(false)
  })

  describe('pulling to refresh', () => {
    it('loads the new transactions itself rather than leaving a button to tap', async () => {
      const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
      installExplorer(state)

      const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // What RefreshSpinner does: refresh the poll first, then hand the list the addresses that moved. Reading them
      // out of a value captured before the poll, as a component callback would, finds none of them.
      state.txsByAddress[A] = [tx('a-new', 3), tx('a-old', 1)]
      const staleRefresh = result.current.refresh

      await act(async () => {
        await queryClient.refetchQueries({ queryKey: ['address', A, 'transaction', 'latest'] })
        await refreshWalletTransactionsFromCache([A, B], NETWORK_ID)
      })

      await waitFor(() => expect(result.current.data.map(({ hash }) => hash)).toEqual(['a-new', 'a-old', 'b-old']))
      expect(result.current.showNewTxsMessage).toBe(false)
      expect(staleRefresh).not.toBe(result.current.refresh)
    })

    it('keeps the pages the user scrolled for when there is nothing new', async () => {
      const state = { txsByAddress: { [A]: [tx('a-old', 1)], [B]: [tx('b-old', 2)] } }
      installExplorer(state)

      const { result } = renderHook(() => useFetchWalletTransactionsInfinite(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(() => result.current.fetchNextPage().then(() => undefined))
      await waitFor(() => expect(cachedWalletListPageCount()).toBe(2))

      await act(async () => {
        await queryClient.refetchQueries({ queryKey: ['address', A, 'transaction', 'latest'] })
        await refreshWalletTransactionsFromCache([A, B], NETWORK_ID)
      })

      expect(cachedWalletListPageCount()).toBe(2)
    })
  })
})
