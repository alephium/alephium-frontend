import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { syncNFTsInfo } from '@/store/assets/assetsActions'
import { nftsAdapter } from '@/store/assets/assetsAdapter'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/store/network/networkActions'
import { NFTsState } from '@/types/assets'

const initialState: NFTsState = nftsAdapter.getInitialState({
  loading: false
})

const nftsSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncNFTsInfo.pending, (state) => {
        state.loading = true
      })
      .addCase(syncNFTsInfo.fulfilled, (state, action) => {
        const nfts = action.payload

        nftsAdapter.upsertMany(state, nfts)
      })
      .addCase(networkPresetSwitched, resetState)
      .addCase(customNetworkSettingsSaved, resetState)
      .addMatcher(isAnyOf(syncNFTsInfo.fulfilled, syncNFTsInfo.rejected), (state) => {
        state.loading = false
      })
  }
})

export default nftsSlice

const resetState = () => initialState
