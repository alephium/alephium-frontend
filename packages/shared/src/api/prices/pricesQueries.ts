/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { queryOptions } from '@tanstack/react-query'
import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import { client, TOKENS_QUERY_LIMIT } from '@/api'
import { Currency } from '@/types'

const tokenPricesBatcher = create({
  fetcher: async (params: { symbol: string; currency: Currency }[]) => {
    const pricesRes = await client.explorer.market.postMarketPrices(
      { currency: params[0].currency.toLowerCase() },
      params.map((p) => p.symbol)
    )
    return pricesRes.map((price, i) => ({
      symbol: params[i].symbol,
      price
    }))
  },
  resolver: (prices, query) => prices.find((price) => price.symbol === query.symbol),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

export const pricesQueries = {
  getAssetPrice: (params: { symbol: string; currency: Currency }) =>
    queryOptions({
      queryKey: ['getAssetPrice', params],
      queryFn: async () => {
        const assetPrice = await tokenPricesBatcher.fetch(params)
        return assetPrice
      }
    })
}
