/*
Copyright 2018 - 2023 The Alephium Authors
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

import { AssetInfo } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { loadingStarted, syncNetworkTokensInfo, syncUnknownTokensInfo } from '@/storage/assets/assetsActions'
import { assetsInfoAdapter } from '@/storage/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/settings/networkActions'

interface AssetsInfoState extends EntityState<AssetInfo> {
  loading: boolean
  status: 'initialized' | 'uninitialized'
  checkedUnknownTokenIds: AssetInfo['id'][]
}

const initialState: AssetsInfoState = assetsInfoAdapter.addOne(
  assetsInfoAdapter.getInitialState({
    loading: false,
    status: 'uninitialized',
    checkedUnknownTokenIds: []
  }),
  {
    ...ALPH,
    verified: true
  }
)

const assetsSlice = createSlice({
  name: 'assetsInfo',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadingStarted, (state) => {
        state.loading = true
      })
      .addCase(syncNetworkTokensInfo.fulfilled, (state, action) => {
        const metadata = action.payload

        if (metadata) {
          assetsInfoAdapter.upsertMany(
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
        const initiallyUnknownTokenIds = action.meta.arg

        state.checkedUnknownTokenIds = [...initiallyUnknownTokenIds, ...state.checkedUnknownTokenIds]

        if (metadata) {
          assetsInfoAdapter.upsertMany(
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
