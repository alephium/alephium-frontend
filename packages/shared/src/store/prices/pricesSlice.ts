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
