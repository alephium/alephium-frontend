/*
Copyright 2018 - 2022 The Alephium Authors
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

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { changeActiveWallet } from '../storage/wallets'
import { ActiveWalletState, GeneratedWallet } from '../types/wallet'
import { appBecameInactive, appReset } from './actions'

const sliceName = 'activeWallet'

const initialState: ActiveWalletState = {
  name: '',
  mnemonic: '',
  isMnemonicBackedUp: false, // TODO: Change to undefined
  metadataId: '',
  authType: undefined
}

export const activeWalletChanged = createAsyncThunk(
  `${sliceName}/activeWalletChanged`,
  async (payload: ActiveWalletState) => {
    const { metadataId } = payload
    if (!metadataId) throw 'Could not change active wallet, metadataId is not set'

    await changeActiveWallet(metadataId)

    return payload
  }
)

const resetState = () => initialState

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletFlushed: resetState,
    newWalletGenerated: (_, action: PayloadAction<GeneratedWallet>) => {
      const { name, mnemonic, metadataId, isMnemonicBackedUp } = action.payload

      return {
        name,
        mnemonic,
        authType: 'pin',
        metadataId,
        isMnemonicBackedUp
      }
    },
    biometricsEnabled: (state) => {
      state.authType = 'biometrics'
    },
    biometricsDisabled: (state) => {
      state.authType = 'pin'
    },
    mnemonicBackedUp: (state) => {
      state.isMnemonicBackedUp = true
    },
    walletDeleted: resetState
  },
  extraReducers: (builder) => {
    builder
      .addCase(activeWalletChanged.fulfilled, (_, action) => action.payload)
      .addCase(appBecameInactive, resetState)
      .addCase(appReset, resetState)
  }
})

export const {
  walletFlushed,
  newWalletGenerated,
  biometricsEnabled,
  biometricsDisabled,
  mnemonicBackedUp,
  walletDeleted
} = activeWalletSlice.actions

export default activeWalletSlice
