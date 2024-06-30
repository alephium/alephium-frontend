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
