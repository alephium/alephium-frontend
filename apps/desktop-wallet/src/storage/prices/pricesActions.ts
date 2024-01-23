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

import { CHART_DATE_FORMAT, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { chunk } from 'lodash'

import client from '@/api/client'
import { HistoricalPrice } from '@/storage/prices/pricesHistorySlice'

export const syncTokenPrices = createAsyncThunk(
  'assets/syncTokenPrices',
  async ({ knownTokenSymbols, currency }: { knownTokenSymbols: string[]; currency: string }) => {
    const tokenPrices = await Promise.all(
      chunk(knownTokenSymbols, TOKENS_QUERY_LIMIT).map((knownTokenSymbolsChunk) =>
        client.explorer.market
          .postMarketPrices(
            {
              currency: currency.toLowerCase()
            },
            knownTokenSymbolsChunk
          )
          .then((prices) =>
            prices.map((price, index) => ({
              symbol: knownTokenSymbolsChunk[index],
              price
            }))
          )
      )
    )

    return tokenPrices.flat()
  }
)

export const syncTokenPricesHistory = createAsyncThunk(
  'assets/syncTokenPricesHistory',
  async ({ tokenSymbol, currency }: { tokenSymbol: string; currency: string }) => {
    const rawHistory = await client.explorer.market.getMarketPricesSymbolCharts(tokenSymbol, {
      currency: currency.toLowerCase()
    })

    const today = dayjs().format(CHART_DATE_FORMAT)
    let history = [] as HistoricalPrice[]

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
      }, [] as HistoricalPrice[])
    }

    return {
      id: tokenSymbol,
      history
    }
  }
)
