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

import {
  syncAddressesAlphHistoricBalances,
  syncAddressesBalances,
  syncAddressesTokens,
  syncAllAddressesTransactionsNextPage,
  syncLatestTransactions
} from '~/store/addressesSlice'

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
      .addCase(syncAddressesAlphHistoricBalances.pending, (state) => {
        state.loadingAlphHistoricBalances = true
      })
      .addCase(syncAddressesAlphHistoricBalances.fulfilled, (state) => {
        state.loadingAlphHistoricBalances = false
      })
      .addCase(syncAddressesAlphHistoricBalances.rejected, (state) => {
        state.loadingAlphHistoricBalances = false
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
