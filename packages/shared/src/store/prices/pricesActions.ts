import { createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { chunk } from 'lodash'

import { client } from '@/api/client'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { CHART_DATE_FORMAT } from '@/constants'
import { TokenHistoricalPrice, TokenPriceEntity, TokenPriceHistoryEntity } from '@/types/price'
import { isPromiseFulfilled } from '@/utils'

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

    tokenPrices = promiseResults.filter(isPromiseFulfilled).flatMap((r) => r.value)

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
            const history = [] as TokenHistoricalPrice[]

            if (rawHistory.timestamps && rawHistory.prices) {
              for (let index = 0; index < rawHistory.timestamps.length; index++) {
                const timestamp = rawHistory.timestamps[index]
                const price = rawHistory.prices[index]

                const itemDate = dayjs(timestamp).format(CHART_DATE_FORMAT)
                const prevItemDate =
                  index > 1 ? dayjs(rawHistory.timestamps[index - 1]).format(CHART_DATE_FORMAT) : undefined

                if (itemDate !== prevItemDate && itemDate !== today) {
                  history.push({
                    date: itemDate,
                    value: price
                  })
                }
              }
            }

            return {
              symbol,
              history,
              status: 'initialized'
            } as TokenPriceHistoryEntity
          })
      )
    )

    tokenPriceHistories = promiseResults.filter(isPromiseFulfilled).flatMap((r) => r.value)

    return tokenPriceHistories
  }
)
