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

import { ALPH } from '@alephium/token-list'
import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { syncFungibleTokensInfo, syncUnknownTokensInfo, syncVerifiedFungibleTokens } from '@/store/assets/assetsActions'
import { fungibleTokensAdapter } from '@/store/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/store/network/networkActions'
import { FungibleTokensState } from '@/types/assets'

const initialState: FungibleTokensState = fungibleTokensAdapter.addOne(
  fungibleTokensAdapter.getInitialState({
    loadingVerified: false,
    loadingUnverified: false,
    loadingTokenTypes: false,
    status: 'uninitialized',
    checkedUnknownTokenIds: []
  }),
  {
    ...ALPH,
    verified: true
  }
)

const fungibleTokensSlice = createSlice({
  name: 'fungibleTokens',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncVerifiedFungibleTokens.pending, (state) => {
        state.loadingVerified = true
      })
      .addCase(syncFungibleTokensInfo.pending, (state) => {
        state.loadingUnverified = true
      })
      .addCase(syncUnknownTokensInfo.pending, (state) => {
        state.loadingTokenTypes = true
      })
      .addCase(syncVerifiedFungibleTokens.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          fungibleTokensAdapter.upsertMany(
            state,
            metadata.tokens.map((tokenInfo) => ({
              ...tokenInfo,
              verified: true
            }))
          )
          state.status = 'initialized'
        }
      })
      .addCase(syncFungibleTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload
        const initiallyUnknownTokenIds = action.meta.arg

        state.checkedUnknownTokenIds = [...initiallyUnknownTokenIds, ...state.checkedUnknownTokenIds]

        if (metadata) {
          fungibleTokensAdapter.upsertMany(
            state,
            metadata.map((token) => ({
              ...token,
              verified: false
            }))
          )
        }
      })
      .addCase(networkPresetSwitched, resetState)
      .addCase(customNetworkSettingsSaved, resetState)
      .addMatcher(isAnyOf(syncFungibleTokensInfo.fulfilled, syncFungibleTokensInfo.rejected), (state) => {
        state.loadingUnverified = false
      })
      .addMatcher(isAnyOf(syncVerifiedFungibleTokens.fulfilled, syncVerifiedFungibleTokens.rejected), (state) => {
        state.loadingVerified = false
      })
      .addMatcher(isAnyOf(syncUnknownTokensInfo.fulfilled, syncUnknownTokensInfo.rejected), (state) => {
        state.loadingTokenTypes = false
      })
  }
})

export default fungibleTokensSlice

// Reducers helper functions

const resetState = () => initialState
