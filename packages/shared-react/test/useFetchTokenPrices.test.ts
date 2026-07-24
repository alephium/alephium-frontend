// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchTokenPrices } from '../src/api/apiDataHooks/market/useFetchTokenPrices'

const { postMarketPrices } = vi.hoisted(() => ({ postMarketPrices: vi.fn() }))

vi.mock('@alephium/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@alephium/shared/api')>()),
  throttledClient: { explorer: { market: { postMarketPrices } } }
}))

let mockListedFtSymbols: string[] = []

vi.mock('../src/api/apiDataHooks/wallet/useFetchWalletTokensByType', () => ({
  useFetchWalletTokensByType: () => ({
    data: { listedFts: mockListedFtSymbols.map((symbol) => ({ symbol })) },
    isLoading: false
  })
}))

vi.mock('../src/network/networkHooks', () => ({ useNetworkId: () => 0 }))

vi.mock('../src/redux', () => ({
  useSharedSelector: (selector: (state: { sharedSettings: { fiatCurrency: string } }) => unknown) =>
    selector({ sharedSettings: { fiatCurrency: 'CHF' } })
}))

describe('useFetchTokenPrices', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    mockListedFtSymbols = []
    postMarketPrices.mockReset()
    postMarketPrices.mockImplementation((_currency: unknown, symbols: string[]) =>
      Promise.resolve(symbols.map(() => 1))
    )
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderPricesHook = () =>
    renderHook(() => useFetchTokenPrices(), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)
    })

  // Reproduces the wallet-switch hang: the observer stays mounted while the symbol set grows to the new wallet's
  // tokens. Since symbols are not in the query key, only the coverage-driven refetch closes the gap.
  it('refetches in place when the symbol set grows without a remount', async () => {
    mockListedFtSymbols = ['ALPH']

    const { result, rerender } = renderPricesHook()

    await waitFor(() => expect(result.current.data).toEqual([{ symbol: 'ALPH', price: 1 }]))

    mockListedFtSymbols = ['ALPH', 'USDC']
    rerender()

    await waitFor(() =>
      expect(result.current.data).toEqual([
        { symbol: 'ALPH', price: 1 },
        { symbol: 'USDC', price: 1 }
      ])
    )
  })

  it('stops refetching once every symbol is covered', async () => {
    mockListedFtSymbols = ['ALPH', 'USDC']

    const { result } = renderPricesHook()

    await waitFor(() => expect(result.current.data).toHaveLength(2))

    const settledCalls = postMarketPrices.mock.calls.length
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(postMarketPrices.mock.calls.length).toBe(settledCalls)
  })
})
