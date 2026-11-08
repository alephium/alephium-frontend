// @vitest-environment happy-dom

import { throttledClient } from '@alephium/shared/api'
import { ExplorerProvider, NodeProvider } from '@alephium/web3'
import { QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import { act, cleanup, renderHook } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { scheduleLockExpiry, useBalanceLockExpiry } from '../src/api/apiDataHooks/address/useBalanceLockExpiry'
import {
  addressAlphBalancesQuery,
  addressBalancesQuery,
  addressLockTimesQuery
} from '../src/api/queries/addressQueries'
import { queryClient } from '../src/api/queryClient'

const now = 1800000000000
const props = { addressHash: 'address-a', networkId: 4, isNodeOnline: true, lockedBalances: 'ALPH:50' }
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children)
const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}
let locks: number[]
let lockedBalance: string
let lockedTokens: string
let utxos: ReturnType<typeof vi.fn>
let balances: ReturnType<typeof vi.fn>
let unsubscribe: (() => void)[]

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  locks = [now + 1000]
  lockedBalance = '50'
  lockedTokens = '0'
  unsubscribe = []
  utxos = vi.fn(async () => ({ utxos: locks.map((lockTime) => ({ lockTime })) }))
  balances = vi.fn(async () => ({ balance: '100', lockedBalance }))
  vi.spyOn(throttledClient, 'node', 'get').mockReturnValue({
    addresses: { getAddressesAddressUtxos: utxos }
  } as unknown as NodeProvider)
  vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
    addresses: {
      getAddressesAddressBalance: balances,
      getAddressesAddressTokensBalance: vi.fn(async () => [
        { tokenId: 'test-token', balance: '20', lockedBalance: lockedTokens }
      ])
    }
  } as unknown as ExplorerProvider)
})

afterEach(async () => {
  cleanup()
  unsubscribe.forEach((off) => off())
  await queryClient.cancelQueries()
  queryClient.clear()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const observeBalances = async () => {
  const observer = new QueryObserver(queryClient, addressBalancesQuery(props))
  unsubscribe.push(observer.subscribe(() => {}))
  await advance(1)
  return observer
}

describe('time-lock expiry', () => {
  it('refreshes ALPH and derived balances without a new transaction', async () => {
    const observer = await observeBalances()
    renderHook(() => useBalanceLockExpiry(props), { wrapper })
    await advance(2)
    expect(observer.getCurrentResult().data?.balances[0].lockedBalance).toBe('50')
    expect(utxos).toHaveBeenCalledWith(
      'address-a',
      { 'error-if-exceed-max-utxos': true },
      { signal: expect.any(AbortSignal) }
    )
    lockedBalance = '0'
    await advance(1000)
    expect(observer.getCurrentResult().data?.balances[0].availableBalance).toBe('100')
    expect(balances).toHaveBeenCalledTimes(2)
  })

  it('arms the next lock and retries if the explorer still reports the previous locked balance', async () => {
    locks = [now + 1000, now + 60000]
    await observeBalances()
    renderHook(() => useBalanceLockExpiry(props), { wrapper })
    await advance(2)
    await advance(1000)
    expect(balances).toHaveBeenCalledTimes(2)
    await advance(10001)
    expect(balances).toHaveBeenCalledTimes(3)
  })

  it('fetches no UTXOs without locked assets and supports token-only locks', async () => {
    const hook = renderHook((p) => useBalanceLockExpiry(p), { wrapper, initialProps: { ...props, lockedBalances: '' } })
    await advance(2)
    expect(utxos).not.toHaveBeenCalled()
    hook.rerender({ ...props, lockedBalances: 'TOKEN:20' })
    await advance(2)
    expect(utxos).toHaveBeenCalledTimes(1)
  })

  it('refreshes token-only locks and stops retries once no locked assets remain', async () => {
    lockedBalance = '0'
    lockedTokens = '20'
    const observer = await observeBalances()
    const hook = renderHook((p) => useBalanceLockExpiry(p), {
      wrapper,
      initialProps: { ...props, lockedBalances: 'test-token:20' }
    })
    await advance(2)
    lockedTokens = '0'
    await advance(1000)
    expect(observer.getCurrentResult().data?.balances.find(({ id }) => id === 'test-token')?.availableBalance).toBe(
      '20'
    )
    hook.rerender({ ...props, lockedBalances: '' })
    const calls = balances.mock.calls.length
    await advance(30000)
    expect(balances).toHaveBeenCalledTimes(calls)
  })

  it('removes timers on unmount and does not invalidate an old network', async () => {
    await observeBalances()
    const otherKey = addressAlphBalancesQuery({ ...props, networkId: 1 }).queryKey
    queryClient.setQueryData(otherKey, {
      addressHash: props.addressHash,
      balances: { totalBalance: '1', lockedBalance: '1', availableBalance: '0' }
    })
    const hook = renderHook(() => useBalanceLockExpiry(props), { wrapper })
    await advance(2)
    await advance(1000)
    expect(queryClient.getQueryState(otherKey)?.isInvalidated).toBe(false)
    hook.unmount()
    const calls = balances.mock.calls.length
    await advance(70000)
    expect(balances).toHaveBeenCalledTimes(calls)
  })

  it('cancels on network/offline changes and rearms after returning online', async () => {
    await observeBalances()
    const hook = renderHook((p) => useBalanceLockExpiry(p), { wrapper, initialProps: props })
    await advance(2)
    hook.rerender({ ...props, isNodeOnline: false })
    await advance(1100)
    expect(balances).toHaveBeenCalledTimes(1)
    hook.rerender(props)
    await advance(10002)
    expect(balances.mock.calls.length).toBeGreaterThan(1)
  })

  it('retries discovery errors without failing the balance query', async () => {
    utxos.mockRejectedValueOnce(new Error('too many UTXOs'))
    await observeBalances()
    renderHook(() => useBalanceLockExpiry(props), { wrapper })
    await advance(2)
    expect(queryClient.getQueryState(addressAlphBalancesQuery(props).queryKey)?.status).toBe('success')
    await advance(10001)
    expect(utxos).toHaveBeenCalledTimes(2)
  })

  it('does not overflow long timeouts or invalidate early', async () => {
    const callback = vi.fn()
    const delay = 2 ** 31 + 1000
    const cancel = scheduleLockExpiry(now + delay, callback)
    await advance(2 ** 31 - 1)
    expect(callback).not.toHaveBeenCalled()
    await advance(1001)
    expect(callback).toHaveBeenCalledTimes(1)
    cancel()
  })

  it('cancels an in-flight UTXO request when the owner unmounts', async () => {
    utxos.mockImplementationOnce(() => new Promise(() => {}))
    const hook = renderHook(() => useBalanceLockExpiry(props), { wrapper })
    await advance(2)
    const signal = utxos.mock.calls[0][2].signal as AbortSignal
    hook.unmount()
    expect(signal.aborted).toBe(true)
    expect(queryClient.getQueryState(addressLockTimesQuery(props).queryKey)?.fetchStatus).toBe('idle')
  })
})
