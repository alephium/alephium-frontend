// @vitest-environment happy-dom

import { ApiBalances, ListedFT } from '@alephium/shared/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { hasMissingTokenPrices, useFetchListedFtsWorth } from '../src/api/apiDataHooks/utils/useFetchListedFtsWorth'
import { TokenPrice, tokensPriceQuery } from '../src/api/queries/priceQueries'

vi.mock('../src/api/apiDataHooks/wallet/useFetchWalletTokensByType', () => ({
  useFetchWalletTokensByType: () => ({ data: { listedFts: [] }, isLoading: false })
}))

vi.mock('../src/network/networkHooks', () => ({
  useNetworkId: () => 0
}))

vi.mock('../src/redux', () => ({
  useSharedSelector: (selector: (state: { sharedSettings: { fiatCurrency: string } }) => unknown) =>
    selector({ sharedSettings: { fiatCurrency: 'CHF' } })
}))

const buildListedFt = (symbol: string, totalBalance: string, decimals: number): ListedFT & ApiBalances => ({
  id: `${symbol}-id`,
  name: symbol,
  symbol,
  decimals,
  description: '',
  logoURI: '',
  totalBalance,
  lockedBalance: '0',
  availableBalance: totalBalance
})

const alph = buildListedFt('ALPH', '2000000000000000000', 18)
const usdc = buildListedFt('USDC', '5000000', 6)
const zeroPricedFt = buildListedFt('ZRO', '1000000000000000000', 18)

const prices: TokenPrice[] = [
  { symbol: 'ALPH', price: 10 },
  { symbol: 'USDC', price: 1 }
]

describe('hasMissingTokenPrices', () => {
  it('returns false when every listed FT has a price entry', () => {
    expect(hasMissingTokenPrices([alph, usdc], prices)).toBe(false)
  })

  it('returns false when the price entry of a listed FT is 0', () => {
    expect(hasMissingTokenPrices([zeroPricedFt], [{ symbol: 'ZRO', price: 0 }])).toBe(false)
  })

  it('returns false when the price entry of a listed FT is null', () => {
    expect(hasMissingTokenPrices([zeroPricedFt], [{ symbol: 'ZRO', price: null as unknown as number }])).toBe(false)
  })

  it('returns false when there are price entries for tokens that are not listed FTs', () => {
    expect(hasMissingTokenPrices([alph], prices)).toBe(false)
  })

  it('returns false when there are no listed FTs', () => {
    expect(hasMissingTokenPrices([], undefined)).toBe(false)
    expect(hasMissingTokenPrices([], prices)).toBe(false)
  })

  it('returns true when a listed FT has no price entry', () => {
    expect(hasMissingTokenPrices([alph, usdc, zeroPricedFt], prices)).toBe(true)
  })

  it('returns true when there are listed FTs but no prices at all', () => {
    expect(hasMissingTokenPrices([alph], undefined)).toBe(true)
    expect(hasMissingTokenPrices([alph], [])).toBe(true)
  })
})

describe('useFetchListedFtsWorth', () => {
  const priceQueryKey = tokensPriceQuery({ symbols: [], currency: 'chf', networkId: 0 }).queryKey

  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { enabled: false, retry: false } } })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderWorthHook = (initialFts: (ListedFT & ApiBalances)[]) =>
    renderHook((listedFts: (ListedFT & ApiBalances)[]) => useFetchListedFtsWorth(listedFts), {
      initialProps: initialFts,
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)
    })

  it('is not loading and sums the worth of all listed FTs when prices cover all of them', () => {
    queryClient.setQueryData(priceQueryKey, [...prices, { symbol: 'ZRO', price: 0 }])

    const { result } = renderWorthHook([alph, usdc, zeroPricedFt])

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBe(25)
  })

  it('keeps loading when a listed FT is missing from the cached prices', () => {
    queryClient.setQueryData(priceQueryKey, [{ symbol: 'ALPH', price: 10 }])

    const { result } = renderWorthHook([alph, usdc])

    expect(result.current.isLoading).toBe(true)
  })

  it('stops loading with the complete worth once prices cover tokens discovered later', async () => {
    queryClient.setQueryData(priceQueryKey, [{ symbol: 'ALPH', price: 10 }])

    const { result, rerender } = renderWorthHook([alph])

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBe(20)

    rerender([alph, usdc])

    expect(result.current.isLoading).toBe(true)

    queryClient.setQueryData(priceQueryKey, prices)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(25)
  })
})
