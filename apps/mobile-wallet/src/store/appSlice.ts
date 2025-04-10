import { appReset } from '@alephium/shared'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { walletDeleted } from '~/store/wallet/walletActions'

const sliceName = 'app'

export interface AppMetadataState {
  isCameraOpen: boolean
}

const initialState: AppMetadataState = {
  isCameraOpen: false
}

const resetState = () => initialState

const appSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    cameraToggled: (state, action: PayloadAction<AppMetadataState['isCameraOpen']>) => {
      state.isCameraOpen = action.payload
    }
  },
  extraReducers(builder) {
    builder.addCase(walletDeleted, resetState).addCase(appReset, resetState)
  }
})

export const { cameraToggled } = appSlice.actions

export default appSlice
