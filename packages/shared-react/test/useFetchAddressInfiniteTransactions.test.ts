// @vitest-environment happy-dom

import { throttledClient } from '@alephium/shared/api'
import { AddressHash } from '@alephium/shared/types'
import { ExplorerProvider } from '@alephium/web3'
import { InfiniteData, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchAddressInfiniteTransactions } from '../src/api/apiDataHooks/address/useFetchAddressInfiniteTransactions'
import { walletTransactionsInfiniteQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'

const NETWORK_ID = 4
const ADDRESS_HASH: AddressHash = 'address-a'
const LATEST_TX_HASH = 'tx-with-unresolved-inputs'

vi.mock('../src/network/networkHooks', () => ({
  useNetworkId: () => NETWORK_ID,
  useIsExplorerOnline: () => true
}))

vi.mock('../src/api/apiDataHooks/address/useFetchAddressLatestTransaction', () => ({
  useFetchAddressLatestTransaction: () => ({
    data: { addressHash: ADDRESS_HASH, latestTx: { hash: LATEST_TX_HASH, timestamp: 2 } },
    isLoading: false
  })
}))

// The latest transaction poll reports this one, but an input whose txHashRef is still unresolved makes
// isConfirmedTx drop it from the page, so the list never catches up on its own.
// See: https://github.com/alephium/alephium-frontend/issues/1367
const unresolvedLatestTx = {
  hash: LATEST_TX_HASH,
  blockHash: 'block-of-latest',
  timestamp: 2,
  inputs: [{ outputRef: { hint: 1, key: 'key' } }],
  outputs: []
}

const olderTx = { hash: 'tx-older', blockHash: 'block-of-older', timestamp: 1, inputs: [], outputs: [] }

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children)

describe('useFetchAddressInfiniteTransactions', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  // The wallet transaction list stays mounted behind the address details modal
  const seedWalletList = () =>
    queryClient.setQueryData<InfiniteData<unknown, unknown>>(
      walletTransactionsInfiniteQuery({ addressHashes: [ADDRESS_HASH], networkId: NETWORK_ID, isExplorerOnline: true })
        .queryKey,
      { pages: [[olderTx], [olderTx]], pageParams: [{ page: 1 }, { page: 2 }] }
    )

  const walletListPages = () =>
    queryClient.getQueryData<InfiniteData<unknown, unknown>>(
      walletTransactionsInfiniteQuery({ addressHashes: [ADDRESS_HASH], networkId: NETWORK_ID, isExplorerOnline: true })
        .queryKey
    )?.pages

  it('re-requests the transactions of the address when the user asks for the new ones', async () => {
    const getAddressesAddressTransactions = vi.fn(async () => [unresolvedLatestTx, olderTx])

    vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
      addresses: { getAddressesAddressTransactions }
    } as unknown as ExplorerProvider)

    seedWalletList()

    const { result } = renderHook(() => useFetchAddressInfiniteTransactions({ addressHash: ADDRESS_HASH }), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getAddressesAddressTransactions).toHaveBeenCalledTimes(1)
    expect(result.current.data.map(({ hash }) => hash)).toEqual([olderTx.hash])
    expect(result.current.showNewTxsMessage).toBe(true)

    await act(() => result.current.refresh())

    expect(getAddressesAddressTransactions).toHaveBeenCalledTimes(2)
    expect(walletListPages()).toHaveLength(2)
  })
})
