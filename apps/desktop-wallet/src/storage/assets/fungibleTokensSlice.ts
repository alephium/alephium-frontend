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

import { FungibleToken } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { syncUnknownTokensInfo, syncVerifiedFungibleTokens } from '@/storage/assets/assetsActions'
import { fungibleTokensAdapter } from '@/storage/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/settings/networkActions'

interface FungibleTokensState extends EntityState<FungibleToken> {
  loadingVerified: boolean
  loadingUnverified: boolean
  status: 'initialized' | 'uninitialized'
  checkedUnknownTokenIds: FungibleToken['id'][]
}

const initialState: FungibleTokensState = fungibleTokensAdapter.addOne(
  fungibleTokensAdapter.getInitialState({
    loadingVerified: false,
    loadingUnverified: false,
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
          state.loadingVerified = false
        }
      })
      .addCase(syncUnknownTokensInfo.pending, (state) => {
        state.loadingUnverified = true
      })
      .addCase(syncUnknownTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload.tokens
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

        state.loadingUnverified = false
      })
      .addCase(networkPresetSwitched, resetState)
      .addCase(customNetworkSettingsSaved, resetState)
  }
})

export default fungibleTokensSlice

// Reducers helper functions

const resetState = () => initialState
