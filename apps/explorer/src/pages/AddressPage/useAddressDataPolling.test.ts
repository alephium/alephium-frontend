import { throttledClient } from '@alephium/shared/api'
import { addressAlphBalancesQuery, addressTransactionsCountQuery } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { QueryObserver, QueryObserverOptions } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { queryClient } from '@/api/queryClient'
import { ADDRESS_DATA_POLLING_INTERVAL, addressDataPollingQuery } from '@/pages/AddressPage/useAddressDataPolling'

const addressHash = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
const networkId = 0

const balanceQuery = () => addressAlphBalancesQuery({ addressHash, networkId, isNodeOnline: true })
const txCountQuery = () => addressTransactionsCountQuery({ addressHash, networkId, isExplorerOnline: true })
const pollingQuery = (isAppVisible = true) =>
  addressDataPollingQuery({ addressHash, networkId, isExplorerOnline: true, isAppVisible })

interface ChainState {
  latestTxHash: string
  balance: string
  txCount: number
}

const setChainState = ({ latestTxHash, balance, txCount }: ChainState) => {
  vi.spyOn(throttledClient.explorer.addresses, 'getAddressesAddressLatestTransaction').mockResolvedValue({
    hash: latestTxHash,
    blockHash: 'block-hash',
    timestamp: 1,
    coinbase: false
  } satisfies e.TransactionInfo)
  vi.spyOn(throttledClient.explorer.addresses, 'getAddressesAddressBalance').mockResolvedValue({
    balance,
    lockedBalance: '0'
  } satisfies e.AddressBalance)
  vi.spyOn(throttledClient.explorer.addresses, 'getAddressesAddressTotalTransactions').mockResolvedValue(txCount)
}

const unsubscribeFns: Array<() => void> = []

// Simulates a mounted component observing a query, without rendering anything
const mountQuery = <TQueryFnData, TError, TData>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryFnData, any>
) => {
  const observer = new QueryObserver(queryClient, options)

  unsubscribeFns.push(observer.subscribe(() => null))

  return observer
}

const runPendingWork = async () => {
  for (let i = 0; i < 20; i++) await vi.advanceTimersByTimeAsync(1)
}

describe('address page data polling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    queryClient.clear()
  })

  afterEach(() => {
    unsubscribeFns.forEach((unsubscribe) => unsubscribe())
    unsubscribeFns.length = 0
    queryClient.clear()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('polls the latest transaction of the address only while the page is visible', () => {
    expect(pollingQuery(true).refetchInterval).toBe(ADDRESS_DATA_POLLING_INTERVAL)
    expect(pollingQuery(false).refetchInterval).toBeUndefined()
  })

  it('refreshes the address header when a new transaction lands', async () => {
    setChainState({ latestTxHash: 'tx-1', balance: '1000', txCount: 1 })

    const balanceObserver = mountQuery(balanceQuery())
    const txCountObserver = mountQuery(txCountQuery())
    mountQuery(pollingQuery())

    await runPendingWork()

    expect(balanceObserver.getCurrentResult().data?.balances.totalBalance).toBe('1000')
    expect(txCountObserver.getCurrentResult().data).toBe(1)

    setChainState({ latestTxHash: 'tx-2', balance: '2000', txCount: 2 })

    await vi.advanceTimersByTimeAsync(ADDRESS_DATA_POLLING_INTERVAL)
    await runPendingWork()

    expect(balanceObserver.getCurrentResult().data?.balances.totalBalance).toBe('2000')
    expect(txCountObserver.getCurrentResult().data).toBe(2)
  })

  it('does not refetch the address header when no new transaction lands', async () => {
    setChainState({ latestTxHash: 'tx-1', balance: '1000', txCount: 1 })

    mountQuery(balanceQuery())
    mountQuery(txCountQuery())
    mountQuery(pollingQuery())

    await runPendingWork()
    vi.clearAllMocks()

    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(ADDRESS_DATA_POLLING_INTERVAL)
      await runPendingWork()
    }

    expect(throttledClient.explorer.addresses.getAddressesAddressLatestTransaction).toHaveBeenCalledTimes(3)
    expect(throttledClient.explorer.addresses.getAddressesAddressBalance).not.toHaveBeenCalled()
    expect(throttledClient.explorer.addresses.getAddressesAddressTotalTransactions).not.toHaveBeenCalled()
  })
})
