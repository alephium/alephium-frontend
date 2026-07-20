import { afterEach, describe, expect, it, vi } from 'vitest'

import { TokenPrice, tokensPriceQuery } from '../src/api/queries/priceQueries'

const { postMarketPrices } = vi.hoisted(() => ({ postMarketPrices: vi.fn() }))

vi.mock('@alephium/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@alephium/shared/api')>()),
  throttledClient: { explorer: { market: { postMarketPrices } } }
}))

const runQueryFn = (symbols: string[]) => {
  const { queryFn } = tokensPriceQuery({ symbols, currency: 'chf', networkId: 0 })

  return (queryFn as unknown as () => Promise<TokenPrice[]>)()
}

describe('tokensPriceQuery queryFn', () => {
  afterEach(() => {
    postMarketPrices.mockReset()
  })

  it('returns one entry per requested symbol, labelled by symbol', async () => {
    postMarketPrices.mockResolvedValue([10, 1, 0])

    await expect(runQueryFn(['ALPH', 'USDC', 'ZRO'])).resolves.toEqual([
      { symbol: 'ALPH', price: 10 },
      { symbol: 'USDC', price: 1 },
      { symbol: 'ZRO', price: 0 }
    ])
  })

  // Guards the coverage invariant useFetchListedFtsWorth relies on: a held token whose price is missing from the
  // response must still get an entry, otherwise hasMissingTokenPrices would never clear and the worth skeleton deadlocks.
  it('pads with 0 so every requested symbol stays covered when the response is short', async () => {
    postMarketPrices.mockResolvedValue([10, 1])

    await expect(runQueryFn(['ALPH', 'USDC', 'ZRO'])).resolves.toEqual([
      { symbol: 'ALPH', price: 10 },
      { symbol: 'USDC', price: 1 },
      { symbol: 'ZRO', price: 0 }
    ])
  })
})
