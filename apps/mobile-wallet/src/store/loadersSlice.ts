import { createSlice } from '@reduxjs/toolkit'

import {
  syncAddressesBalances,
  syncAddressesTokens,
  syncAllAddressesTransactionsNextPage,
  syncLatestTransactions
} from '~/store/addresses/addressesActions'

const sliceName = 'loaders'

export interface LoadersState {
  loadingBalances: boolean
  loadingTokens: boolean
  loadingLatestTransactions: boolean
  loadingTransactionsNextPage: boolean
  loadingAlphHistoricBalances: boolean
}

const initialState: LoadersState = {
  loadingBalances: false,
  loadingTokens: false,
  loadingLatestTransactions: false,
  loadingTransactionsNextPage: false,
  loadingAlphHistoricBalances: false
}

const loadersSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncAddressesBalances.pending, (state) => {
        state.loadingBalances = true
      })
      .addCase(syncAddressesBalances.fulfilled, (state) => {
        state.loadingBalances = false
      })
      .addCase(syncAddressesBalances.rejected, (state) => {
        state.loadingBalances = false
      })
      .addCase(syncLatestTransactions.pending, (state) => {
        state.loadingLatestTransactions = true
      })
      .addCase(syncLatestTransactions.fulfilled, (state) => {
        state.loadingLatestTransactions = false
      })
      .addCase(syncLatestTransactions.rejected, (state) => {
        state.loadingLatestTransactions = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.pending, (state) => {
        state.loadingTransactionsNextPage = true
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state) => {
        state.loadingTransactionsNextPage = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.rejected, (state) => {
        state.loadingTransactionsNextPage = false
      })
      .addCase(syncAddressesTokens.pending, (state) => {
        state.loadingTokens = true
      })
      .addCase(syncAddressesTokens.fulfilled, (state) => {
        state.loadingTokens = false
      })
      .addCase(syncAddressesTokens.rejected, (state) => {
        state.loadingTokens = false
      })
  }
})

export default loadersSlice
