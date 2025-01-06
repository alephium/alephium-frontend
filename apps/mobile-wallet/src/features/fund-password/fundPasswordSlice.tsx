import { appReset } from '@alephium/shared'
import { createSlice } from '@reduxjs/toolkit'

import { fundPasswordUseToggled } from '~/features/fund-password/fundPasswordActions'
import { walletDeleted } from '~/store/wallet/walletActions'

const sliceName = 'fundPassword'

interface AppMetadataState {
  isActive: boolean
}

const initialState: AppMetadataState = {
  isActive: false
}

const resetState = () => initialState

const appSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fundPasswordUseToggled, (state, { payload }) => {
        state.isActive = payload
      })
      .addCase(walletDeleted, resetState)
      .addCase(appReset, resetState)
  }
})

export default appSlice
