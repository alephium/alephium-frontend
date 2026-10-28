// @vitest-environment happy-dom

import { throttledClient } from '@alephium/shared/api'
import { selectSentTransactionByHash, sharedReducer, transactionSent } from '@alephium/shared/store'
import { isConfirmedTx } from '@alephium/shared/transactions'
import { explorer as e, ExplorerProvider, node as n } from '@alephium/web3'
import { configureStore } from '@reduxjs/toolkit'
import { onlineManager, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchTransaction } from '../src/api/apiDataHooks/transaction/useFetchTransaction'
import { confirmedTransactionQuery, pendingTransactionQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'
import { usePendingTxPolling } from '../src/features/dataPolling/usePendingTxPolling'

const NETWORK_ID = 4
const TX_HASH = 'transaction-hash'
const ADDRESS_HASHES = ['address-a']
const network = vi.hoisted(() => ({ explorerOnline: true, nodeOnline: true }))

vi.mock('../src/network/networkHooks', () => ({
  useNetworkId: () => NETWORK_ID,
  useIsExplorerOnline: () => network.explorerOnline,
  useIsExplorerOffline: () => !network.explorerOnline,
  useIsNodeOnline: () => network.nodeOnline
}))

vi.mock('../src/hooks/addresses/useUnsortedAddresses', () => ({
  useUnsortedAddressesHashes: () => ADDRESS_HASHES
}))

const pendingTx: e.PendingTransaction = {
  hash: TX_HASH,
  chainFrom: 0,
  chainTo: 0,
  inputs: [{ address: ADDRESS_HASHES[0], outputRef: { hint: 0, key: 'input-key' }, contractInput: false }],
  outputs: [],
  gasAmount: 20000,
  gasPrice: '100000000000',
  lastSeen: 1,
  type: 'pending'
}

const confirmedTx: e.AcceptedTransaction = {
  hash: TX_HASH,
  blockHash: 'block-hash',
  timestamp: 2,
  inputs: pendingTx.inputs?.map((input) => ({ ...input, txHashRef: 'previous-transaction' })),
  outputs: [],
  version: 0,
  networkId: NETWORK_ID,
  gasAmount: pendingTx.gasAmount,
  gasPrice: pendingTx.gasPrice,
  scriptExecutionOk: true,
  coinbase: false,
  type: 'confirmed'
}

const confirmedQueryKey = confirmedTransactionQuery({
  txHash: TX_HASH,
  addressHashes: ADDRESS_HASHES,
  networkId: NETWORK_ID,
  isExplorerOnline: true
}).queryKey

const pendingQueryKey = pendingTransactionQuery({
  txHash: TX_HASH,
  networkId: NETWORK_ID,
  isNodeOnline: true
}).queryKey

let store = configureStore({ reducer: sharedReducer })

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(Provider, { store, children: createElement(QueryClientProvider, { client: queryClient }, children) })

const renderTransaction = () => renderHook(() => useFetchTransaction({ txHash: TX_HASH }), { wrapper })

const advance = async (milliseconds = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds)
  })
  // React Query batches observer notifications through a timer.
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1)
  })
}

const markSent = () =>
  store.dispatch(
    transactionSent({
      hash: TX_HASH,
      fromAddress: ADDRESS_HASHES[0],
      toAddress: 'address-b',
      timestamp: 1,
      type: 'transfer',
      amount: '1',
      status: 'sent'
    })
  )

describe('useFetchTransaction', () => {
  const getTransaction = vi.fn<() => Promise<e.PendingTransaction | e.AcceptedTransaction>>()

  beforeEach(() => {
    vi.useFakeTimers()
    queryClient.clear()
    onlineManager.setOnline(true)
    network.explorerOnline = true
    network.nodeOnline = true
    store = configureStore({ reducer: sharedReducer })
    getTransaction.mockReset().mockResolvedValue(pendingTx)
    vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
      transactions: { getTransactionsTransactionHash: getTransaction }
    } as unknown as ExplorerProvider)
  })

  afterEach(() => {
    cleanup()
    queryClient.clear()
    onlineManager.setOnline(true)
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('refreshes a pending transaction without a local sent record until its inputs resolve', async () => {
    const unresolvedTx = { ...confirmedTx, inputs: pendingTx.inputs }
    getTransaction.mockResolvedValueOnce(pendingTx).mockResolvedValueOnce(unresolvedTx).mockResolvedValue(confirmedTx)

    const { result } = renderTransaction()
    await advance()
    expect(result.current.data).toEqual(pendingTx)
    expect(result.current.isLoading).toBe(false)
    expect(getTransaction).toHaveBeenCalledTimes(1)

    await advance(3000)
    expect(result.current.data).toEqual(unresolvedTx)
    expect(isConfirmedTx(result.current.data!)).toBe(false)

    await advance(3000)
    expect(result.current.data).toEqual(confirmedTx)
    expect(getTransaction).toHaveBeenCalledTimes(3)

    await advance(30000)
    expect(getTransaction).toHaveBeenCalledTimes(3)
  })

  it('refreshes a cached pending response immediately when details reopen', async () => {
    queryClient.setQueryData(confirmedQueryKey, pendingTx)
    getTransaction.mockResolvedValue(confirmedTx)

    const { result } = renderTransaction()
    await advance()

    expect(result.current.data).toEqual(confirmedTx)
    expect(getTransaction).toHaveBeenCalledTimes(1)
  })

  it.each([true, false])(
    'keeps an already confirmed response cached (scriptExecutionOk=%s)',
    async (scriptExecutionOk) => {
      const tx = { ...confirmedTx, scriptExecutionOk }
      getTransaction.mockResolvedValue(tx)
      const { result, unmount } = renderTransaction()
      await advance()
      expect(result.current.data).toEqual(tx)

      await advance(30000)
      unmount()
      renderTransaction()
      await advance(30000)

      expect(getTransaction).toHaveBeenCalledTimes(1)
    }
  )

  it('uses the locally sent transaction poll even when the other query cached pending data', async () => {
    markSent()
    queryClient.setQueryData(confirmedQueryKey, pendingTx)
    queryClient.setQueryData(pendingQueryKey, pendingTx)
    getTransaction.mockResolvedValueOnce(pendingTx).mockResolvedValue(confirmedTx)

    const { result } = renderTransaction()
    await advance()
    expect(result.current.data).toEqual(pendingTx)

    await advance(3000)
    expect(result.current.data).toEqual(confirmedTx)
    expect(getTransaction).toHaveBeenCalledTimes(2)
  })

  it('updates a locally sent transaction and stops polling when the sent record confirms', async () => {
    markSent()
    getTransaction.mockResolvedValueOnce(pendingTx).mockResolvedValue(confirmedTx)
    const { result } = renderHook(
      () => {
        usePendingTxPolling(TX_HASH)

        return useFetchTransaction({ txHash: TX_HASH })
      },
      { wrapper }
    )

    await advance(3000)
    expect(result.current.data).toEqual(pendingTx)
    expect(selectSentTransactionByHash(store.getState(), TX_HASH)?.status).toBe('mempooled')

    await advance(3000)
    expect(result.current.data).toEqual(confirmedTx)
    expect(selectSentTransactionByHash(store.getState(), TX_HASH)?.status).toBe('confirmed')
    const requestsAfterConfirmation = getTransaction.mock.calls.length

    await advance(30000)
    expect(getTransaction).toHaveBeenCalledTimes(requestsAfterConfirmation)
  })

  it('prefers confirmed data over an older pending-query cache', async () => {
    queryClient.setQueryData(confirmedQueryKey, confirmedTx)
    queryClient.setQueryData(pendingQueryKey, pendingTx)

    const { result } = renderTransaction()
    await advance(30000)

    expect(result.current.data).toEqual(confirmedTx)
    expect(getTransaction).not.toHaveBeenCalled()
  })

  it('does not expose node RichTransaction data as explorer transaction details', async () => {
    markSent()
    network.nodeOnline = false
    queryClient.setQueryData(pendingQueryKey, { unsigned: { txId: TX_HASH } } as n.RichTransaction)

    const { result } = renderTransaction()
    await advance(30000)

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(getTransaction).not.toHaveBeenCalled()
  })

  it('honors skip for cached pending data and refreshes when enabled again', async () => {
    queryClient.setQueryData(confirmedQueryKey, pendingTx)
    getTransaction.mockResolvedValue(confirmedTx)
    const { result, rerender } = renderHook(({ skip }) => useFetchTransaction({ txHash: TX_HASH, skip }), {
      initialProps: { skip: true },
      wrapper
    })

    await advance(30000)
    expect(result.current.data).toEqual(pendingTx)
    expect(getTransaction).not.toHaveBeenCalled()

    rerender({ skip: false })
    await advance()
    expect(result.current.data).toEqual(confirmedTx)
  })

  it('honors explorer offline state and refreshes when it comes online', async () => {
    network.explorerOnline = false
    queryClient.setQueryData(confirmedQueryKey, pendingTx)
    getTransaction.mockResolvedValue(confirmedTx)
    const { result, rerender } = renderTransaction()

    await advance(30000)
    expect(getTransaction).not.toHaveBeenCalled()

    network.explorerOnline = true
    rerender()
    await advance()
    expect(result.current.data).toEqual(confirmedTx)
  })

  it('does not send interval requests while the query client is offline', async () => {
    const { result } = renderTransaction()
    await advance()
    expect(result.current.data).toEqual(pendingTx)
    onlineManager.setOnline(false)
    getTransaction.mockResolvedValue(confirmedTx)

    await advance(9000)
    expect(getTransaction).toHaveBeenCalledTimes(1)

    onlineManager.setOnline(true)
    await advance()
    expect(result.current.data).toEqual(confirmedTx)
  })

  it('keeps the existing retry policy for an initial non-retryable error', async () => {
    getTransaction.mockRejectedValue(new Error('Status code: 404'))
    const { result } = renderTransaction()
    await advance(30000)

    expect(getTransaction).toHaveBeenCalledTimes(1)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('keeps the existing rate-limit retry behavior', async () => {
    getTransaction.mockRejectedValueOnce(new Error('Status code: 429')).mockResolvedValue(confirmedTx)
    const { result } = renderTransaction()
    await advance(1000)

    expect(getTransaction).toHaveBeenCalledTimes(2)
    expect(result.current.data).toEqual(confirmedTx)
  })

  it('retains pending details through a failed refresh and resumes polling', async () => {
    getTransaction
      .mockResolvedValueOnce(pendingTx)
      .mockRejectedValueOnce(new Error('Status code: 500'))
      .mockResolvedValue(confirmedTx)
    const { result } = renderTransaction()
    await advance()
    await advance(3000)
    expect(result.current.data).toEqual(pendingTx)

    await advance(3000)
    expect(result.current.data).toEqual(confirmedTx)
    expect(getTransaction).toHaveBeenCalledTimes(3)
  })

  it('stops interval requests when details unmount', async () => {
    const { unmount } = renderTransaction()
    await advance()
    expect(getTransaction).toHaveBeenCalledTimes(1)

    unmount()
    await advance(30000)
    expect(getTransaction).toHaveBeenCalledTimes(1)
  })
})
