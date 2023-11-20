/*
Copyright 2018 - 2023 The Alephium Authors
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

import { TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { chunk } from 'lodash'

import client from '@/api/client'
import { loadingStarted } from '@/storage/assets/assetsActions'

export const syncTokenPrices = createAsyncThunk(
  'assets/syncTokenPrices',
  async ({ knownTokenSymbols, currency }: { knownTokenSymbols: string[]; currency: string }, { dispatch }) => {
    dispatch(loadingStarted())

    const tokenPrices = await Promise.all(
      chunk(knownTokenSymbols, TOKENS_QUERY_LIMIT).map((knownTokenSymbolsChunk) =>
        client.explorer.market.getMarketPrices({
          ids: knownTokenSymbolsChunk.map((s) => s.toLowerCase()),
          currency: currency.toLowerCase()
        })
      )
    )

    return tokenPrices
  }
)
