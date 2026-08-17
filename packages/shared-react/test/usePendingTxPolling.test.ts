// @vitest-environment happy-dom

import { batchers, throttledClient } from '@alephium/shared/api'
import { selectSentTransactionByHash, sharedReducer, transactionSent, walletLocked } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { explorer as e, ExplorerProvider } from '@alephium/web3'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchWalletTransactionsInfinite } from '../src/api/apiDataHooks/wallet/useFetchWalletTransactionsInfinite'
import { pendingTransactionQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'
import { usePendingTxPolling } from '../src/features/dataPolling/usePendingTxPolling'

const NETWORK_ID = 4
const A: AddressHash = 'address-a'
const SENT_TX_HASH = 'sent-tx'

vi.mock('../src/network/networkHooks', () => ({
  useNetworkId: () => NETWORK_ID,
  useIsExplorerOnline: () => true,
  useIsExplorerOffline: () => false,
  useIsNodeOnline: () => true
}))

vi.mock('../src/hooks/addresses/useUnsortedAddresses', () => ({
  useUnsortedAddressesHashes: () => [A]
}))

const confirmedTx = (hash: string, timestamp: number) => ({
  hash,
  blockHash: `block-of-${hash}`,
  timestamp,
  inputs: [{ address: A, txHashRef: 'previous-tx' }],
  outputs: [{ address: A }]
})

const mempooledTx = (hash: string) => ({ hash, inputs: [{ address: A }], outputs: [{ address: A }] })

interface ExplorerState {
  txsByAddress: Record<AddressHash, ReturnType<typeof confirmedTx>[]>
  sentTx: ReturnType<typeof confirmedTx> | ReturnType<typeof mempooledTx>
}

const store = configureStore({ reducer: sharedReducer })

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(Provider, { store, children: createElement(QueryClientProvider, { client: queryClient }, children) })

const pendingTxQueryKey = pendingTransactionQuery({
  txHash: SENT_TX_HASH,
  networkId: NETWORK_ID,
  isNodeOnline: true
}).queryKey

const installExplorer = (state: ExplorerState) => {
  const getAddressesAddressTransactions = vi.fn(async (addressHash: AddressHash, { page }: { page: number }) =>
    page === 1 ? state.txsByAddress[addressHash] ?? [] : []
  )

  const postAddressesLatestTransactions = vi.fn(async (addressHashes: AddressHash[]) =>
    addressHashes
      .map((address) => ({ address, transactionInfo: state.txsByAddress[address]?.[0] }))
      .filter(({ transactionInfo }) => transactionInfo !== undefined)
  )

  vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
    addresses: { getAddressesAddressTransactions, postAddressesLatestTransactions },
    transactions: { getTransactionsTransactionHash: vi.fn(async () => state.sentTx) }
  } as unknown as ExplorerProvider)
  batchers.init()

  return { getAddressesAddressTransactions }
}

const renderListAndPoller = () =>
  renderHook(
    () => {
      usePendingTxPolling(SENT_TX_HASH)

      return useFetchWalletTransactionsInfinite()
    },
    { wrapper }
  )

const pendingState = (): ExplorerState => ({
  txsByAddress: { [A]: [confirmedTx('older-tx', 1)] },
  sentTx: mempooledTx(SENT_TX_HASH)
})

// Seeded so the poll answers straight away: its first fetch otherwise waits out the delay that keeps a freshly
// broadcast transaction from being asked for before it has reached the mempool
const seedPoll = (state: ExplorerState) =>
  queryClient.setQueryData(pendingTxQueryKey, state.sentTx as unknown as e.AcceptedTransaction)

const confirmSentTx = (state: ExplorerState) => {
  state.sentTx = confirmedTx(SENT_TX_HASH, 3)
  state.txsByAddress[A] = [confirmedTx(SENT_TX_HASH, 3), confirmedTx('older-tx', 1)]

  return act(() => queryClient.refetchQueries({ queryKey: pendingTxQueryKey }))
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('usePendingTxPolling', () => {
  beforeEach(() => {
    queryClient.clear()
    store.dispatch(walletLocked())
    store.dispatch(
      transactionSent({
        hash: SENT_TX_HASH,
        fromAddress: A,
        toAddress: 'address-b',
        timestamp: 3,
        type: 'transfer',
        amount: '1',
        status: 'sent'
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  it('takes the transaction the user sent into the list as soon as it confirms', async () => {
    const state = pendingState()
    installExplorer(state)
    seedPoll(state)

    const { result } = renderListAndPoller()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data.map(({ hash }) => hash)).toEqual(['older-tx'])

    await confirmSentTx(state)

    await waitFor(() => expect(result.current.data.map(({ hash }) => hash)).toEqual([SENT_TX_HASH, 'older-tx']))
    expect(selectSentTransactionByHash(store.getState(), SENT_TX_HASH)?.status).toBe('confirmed')
  })

  it('rebuilds the list once, rather than on every render that follows the confirmation', async () => {
    const state = pendingState()
    const { getAddressesAddressTransactions } = installExplorer(state)
    seedPoll(state)

    const { result, rerender } = renderListAndPoller()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await confirmSentTx(state)
    await waitFor(() => expect(result.current.data.map(({ hash }) => hash)).toEqual([SENT_TX_HASH, 'older-tx']))

    await act(async () => {
      rerender()
      await settle()
    })

    // The page the list loaded on its own, then the one the confirmation asked for
    expect(getAddressesAddressTransactions).toHaveBeenCalledTimes(2)
  })
})
