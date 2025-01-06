import { appReset, FungibleToken, syncUnknownTokensInfo } from '@alephium/shared'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import {
  appLaunchedWithLastUsedWallet,
  newWalletGenerated,
  newWalletImportedWithMetadata,
  walletDeleted,
  walletUnlocked
} from '~/store/wallet/walletActions'

const sliceName = 'app'

export interface AppMetadataState {
  isCameraOpen: boolean
  checkedUnknownTokenIds: FungibleToken['id'][]
  wasJustLaunched: boolean
}

const initialState: AppMetadataState = {
  isCameraOpen: false,
  checkedUnknownTokenIds: [],
  wasJustLaunched: false
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
    builder
      .addCase(walletDeleted, resetState)
      .addCase(syncUnknownTokensInfo.fulfilled, (state, action) => {
        const initiallyUnknownTokenIds = action.meta.arg

        state.checkedUnknownTokenIds = [...initiallyUnknownTokenIds, ...state.checkedUnknownTokenIds]
      })
      .addCase(appReset, resetState)
      .addCase(appLaunchedWithLastUsedWallet, (state) => {
        state.wasJustLaunched = true
      })
    builder.addMatcher(isAnyOf(walletUnlocked, newWalletGenerated, newWalletImportedWithMetadata), (state) => {
      state.wasJustLaunched = false
    })
  }
})

export const { cameraToggled } = appSlice.actions

export default appSlice
