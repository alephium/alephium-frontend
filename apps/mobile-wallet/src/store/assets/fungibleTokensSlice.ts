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

// TODO: Same as in desktop wallet

import { AssetInfo } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { loadingStarted, syncNetworkFungibleTokensInfo, syncUnknownTokensInfo } from '~/store/assets/assetsActions'
import { fungibleTokensAdapter } from '~/store/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'

interface FungibleTokensState extends EntityState<AssetInfo> {
  loading: boolean
  status: 'initialized' | 'uninitialized'
}

const initialState: FungibleTokensState = fungibleTokensAdapter.addOne(
  fungibleTokensAdapter.getInitialState({
    loading: false,
    status: 'uninitialized'
  }),
  {
    ...ALPH,
    verified: true
  }
)

const assetsSlice = createSlice({
  name: 'fungibleTokens',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadingStarted, (state) => {
        state.loading = true
      })
      .addCase(syncNetworkFungibleTokensInfo.fulfilled, (state, action) => {
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
          state.loading = false
        }
      })
      .addCase(syncUnknownTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload.tokens

        if (metadata) {
          fungibleTokensAdapter.upsertMany(
            state,
            metadata.map((token) => ({
              ...token,
              verified: false
            }))
          )
        }

        state.loading = false
      })
      .addCase(networkPresetSwitched, resetState)
      .addCase(customNetworkSettingsSaved, resetState)
  }
})

export default assetsSlice

// Reducers helper functions

const resetState = () => initialState
