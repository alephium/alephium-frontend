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

import { uniq } from 'lodash'

import { TOKENS_WITH_PRICE } from '@/api/assets/assetsApiHooks'
import { baseApi } from '@/api/baseApi'
import { client } from '@/api/client'
import { ONE_MINUTE_MS } from '@/constants'
import { Currency } from '@/types'

export const pricesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPrices: build.query<Record<string, number>, { tokenSymbols: string[]; currency: Currency }>({
      queryFn: async ({ tokenSymbols, currency }) => {
        const availableTokensSymbols = TOKENS_WITH_PRICE
        const tokensToFetch = uniq(tokenSymbols).filter(
          (symbol) => !!symbol && !!availableTokensSymbols && availableTokensSymbols.includes(symbol)
        )

        const prices = await client.explorer.market.postMarketPrices({ currency }, tokensToFetch)

        return {
          data: tokensToFetch.reduce(
            (acc, symbol, i) => {
              acc[symbol] = prices[i]
              return acc
            },
            {} as Record<string, number>
          )
        }
      },
      providesTags: (result, error, { tokenSymbols }) =>
        tokenSymbols.map((s) => ({
          type: 'Price',
          tokenSymbol: s
        })),
      keepUnusedDataFor: ONE_MINUTE_MS / 1000
    })
  })
})

export const { useGetPricesQuery } = pricesApi
