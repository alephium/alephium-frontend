import { TOKENS_QUERY_LIMIT, client } from '@/api'
import { ONE_MINUTE_MS } from '@/constants'
import { queryOptions } from '@tanstack/react-query'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

export const marketQueries = {
  price: (tokenSymbol: string, currency = 'usd') =>
    queryOptions({
      queryKey: ['tokenPrice', tokenSymbol, currency],
      queryFn: async () => prices.fetch(tokenSymbol, currency)
    })
}

const prices = create({
  fetcher: async (queries: { symbol: string; currency: string }[]) =>
    (
      await client.explorer.market.postMarketPrices(
        { currency: queries[0].currency },
        queries.map((q) => q.symbol)
      )
    ).map((price, i) => ({
      symbol: symbols[i],
      price
    })),
  resolver: keyResolver('symbol'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})
