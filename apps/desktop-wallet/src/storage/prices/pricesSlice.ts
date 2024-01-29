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

import { syncTokenPrices } from '@/storage/prices/pricesActions'
import { tokenPricesAdapter } from '@/storage/prices/pricesAdapter'
import { TokenPriceEntity } from '@/types/price'

interface PricesState extends EntityState<TokenPriceEntity> {
  loading: boolean
}

const initialState: PricesState = tokenPricesAdapter.getInitialState({
  loading: false
})

const pricesSlice = createSlice({
  name: 'tokenPrices',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncTokenPrices.pending, (state) => {
        state.loading = true
      })
      .addCase(syncTokenPrices.fulfilled, (state, action) => {
        const prices = action.payload

        if (prices) {
          tokenPricesAdapter.upsertMany(state, prices)
        }

        state.loading = false
      })
      .addCase(syncTokenPrices.rejected, (state) => {
        state.loading = false
      })
  }
})

export default pricesSlice
