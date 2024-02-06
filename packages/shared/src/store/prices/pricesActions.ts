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

import { createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { chunk } from 'lodash'

import { client } from '@/api/client'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { CHART_DATE_FORMAT } from '@/constants'
import { TokenHistoricalPrice, TokenPriceEntity, TokenPriceHistoryEntity } from '@/types/price'
import { isFulfilled } from '@/utils'

export const syncTokenCurrentPrices = createAsyncThunk(
  'assets/syncTokenCurrentPrices',
  async ({ verifiedFungibleTokenSymbols, currency }: { verifiedFungibleTokenSymbols: string[]; currency: string }) => {
    let tokenPrices = [] as TokenPriceEntity[]

    const promiseResults = await Promise.allSettled(
      chunk(verifiedFungibleTokenSymbols, TOKENS_QUERY_LIMIT).map((verifiedFungibleTokenSymbolsChunk) =>
        client.explorer.market
          .postMarketPrices(
            {
              currency: currency.toLowerCase()
            },
            verifiedFungibleTokenSymbolsChunk
          )
          .then((prices) =>
            prices.map((price, index) => ({
              symbol: verifiedFungibleTokenSymbolsChunk[index],
              price
            }))
          )
      )
    )

    tokenPrices = promiseResults.filter(isFulfilled).flatMap((r) => r.value)

    return tokenPrices
  }
)

export const syncTokenPriceHistories = createAsyncThunk(
  'assets/syncTokenPriceHistories',
  async ({ verifiedFungibleTokenSymbols, currency }: { verifiedFungibleTokenSymbols: string[]; currency: string }) => {
    let tokenPriceHistories = [] as TokenPriceHistoryEntity[]

    const promiseResults = await Promise.allSettled(
      verifiedFungibleTokenSymbols.map((symbol) =>
        client.explorer.market
          .getMarketPricesSymbolCharts(symbol, {
            currency: currency.toLowerCase()
          })
          .then((rawHistory) => {
            const today = dayjs().format(CHART_DATE_FORMAT)
            let history = [] as TokenHistoricalPrice[]

            if (rawHistory.timestamps && rawHistory.prices) {
              const pricesHistoryArray = rawHistory.prices

              history = rawHistory.timestamps.reduce((acc, v, index) => {
                const itemDate = dayjs(v).format(CHART_DATE_FORMAT)
                const isDuplicatedItem = !!acc.find(({ date }) => dayjs(date).format(CHART_DATE_FORMAT) === itemDate)

                if (!isDuplicatedItem && itemDate !== today)
                  acc.push({
                    date: itemDate,
                    value: pricesHistoryArray[index]
                  })

                return acc
              }, [] as TokenHistoricalPrice[])
            }

            return {
              symbol,
              history,
              status: 'initialized'
            } as TokenPriceHistoryEntity
          })
      )
    )

    tokenPriceHistories = promiseResults.filter(isFulfilled).flatMap((r) => r.value)

    return tokenPriceHistories
  }
)
