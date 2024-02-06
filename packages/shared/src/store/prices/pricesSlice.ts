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

import { syncTokenCurrentPrices } from '@/store/prices/pricesActions'
import { tokenPricesAdapter } from '@/store/prices/pricesAdapter'
import { PricesState } from '@/types/price'

const initialState: PricesState = tokenPricesAdapter.getInitialState({
  loading: false,
  status: 'uninitialized'
})

const pricesSlice = createSlice({
  name: 'tokenPrices',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncTokenCurrentPrices.pending, (state) => {
        state.loading = true
      })
      .addCase(syncTokenCurrentPrices.fulfilled, (state, action) => {
        const prices = action.payload

        if (prices) {
          tokenPricesAdapter.upsertMany(state, prices)
        }

        state.loading = false
        state.status = 'initialized'
      })
      .addCase(syncTokenCurrentPrices.rejected, (state) => {
        state.loading = false
      })
  }
})

export default pricesSlice
