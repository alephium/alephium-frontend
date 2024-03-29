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

import { createSlice } from '@reduxjs/toolkit'

import { syncTokenPriceHistories } from '@/store/prices/pricesActions'
import { tokenPricesHistoryAdapter } from '@/store/prices/pricesAdapter'
import { fiatCurrencyChanged } from '@/store/settings/settingsActions'
import { PricesHistoryState } from '@/types/price'

const initialState: PricesHistoryState = tokenPricesHistoryAdapter.getInitialState({
  loading: false
})

const pricesHistorySlice = createSlice({
  name: 'tokenPricesHistory',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncTokenPriceHistories.pending, (state) => {
        state.loading = true
      })
      .addCase(syncTokenPriceHistories.fulfilled, (state, action) => {
        const tokenPriceHistories = action.payload
        const verifiedFungibleTokenSymbols = action.meta.arg.verifiedFungibleTokenSymbols

        tokenPricesHistoryAdapter.upsertMany(
          state,
          verifiedFungibleTokenSymbols.map((symbol) => ({
            symbol,
            history: tokenPriceHistories.find((history) => history.symbol === symbol)?.history ?? [],
            status: 'initialized'
          }))
        )

        state.loading = false
      })
      .addCase(syncTokenPriceHistories.rejected, (state) => {
        state.loading = false
      })
      .addCase(fiatCurrencyChanged, (state) => {
        tokenPricesHistoryAdapter.removeAll(state)
      })
  }
})

export default pricesHistorySlice
