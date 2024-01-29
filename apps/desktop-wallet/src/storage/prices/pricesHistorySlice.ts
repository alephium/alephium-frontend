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

import { createSlice, EntityState } from '@reduxjs/toolkit'

import { syncTokenPricesHistory } from '@/storage/prices/pricesActions'
import { tokenPricesHistoryAdapter } from '@/storage/prices/pricesAdapter'
import { TokenPriceHistoryEntity } from '@/types/price'

interface PricesHistoryState extends EntityState<TokenPriceHistoryEntity> {
  loading: boolean
}

const initialState: PricesHistoryState = tokenPricesHistoryAdapter.getInitialState({
  loading: false
})

const pricesHistorySlice = createSlice({
  name: 'tokenPricesHistory',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncTokenPricesHistory.pending, (state) => {
        state.loading = true
      })
      .addCase(syncTokenPricesHistory.fulfilled, (state, action) => {
        const tokenPriceHistory = action.payload

        if (tokenPriceHistory) {
          tokenPricesHistoryAdapter.upsertOne(state, tokenPriceHistory)
        }

        state.loading = false
      })
      .addCase(syncTokenPricesHistory.rejected, (state) => {
        state.loading = false
      })
  }
})

export default pricesHistorySlice
