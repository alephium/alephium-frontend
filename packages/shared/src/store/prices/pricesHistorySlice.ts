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
