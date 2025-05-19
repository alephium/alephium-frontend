import { createAsyncThunk } from '@reduxjs/toolkit'
import { chunk } from 'lodash'

import { throttledClient } from '@/api'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { TokenPriceEntity } from '@/types/price'
import { isPromiseFulfilled } from '@/utils'

export const syncTokenCurrentPrices = createAsyncThunk(
  'assets/syncTokenCurrentPrices',
  async ({ verifiedFungibleTokenSymbols, currency }: { verifiedFungibleTokenSymbols: string[]; currency: string }) => {
    let tokenPrices = [] as TokenPriceEntity[]

    const promiseResults = await Promise.allSettled(
      chunk(verifiedFungibleTokenSymbols, TOKENS_QUERY_LIMIT).map((verifiedFungibleTokenSymbolsChunk) =>
        throttledClient.explorer.market
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
