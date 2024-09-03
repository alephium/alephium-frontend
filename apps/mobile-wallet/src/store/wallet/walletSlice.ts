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

import { appBecameInactive, appReset } from '@alephium/shared'
import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  appLaunchedWithLastUsedWallet,
  newWalletGenerated,
  newWalletImportedWithMetadata,
  walletDeleted,
  walletNameChanged,
  walletUnlocked
} from '~/store/wallet/walletActions'
import { WalletState } from '~/types/wallet'

const sliceName = 'wallet'

const initialState: WalletState = {
  id: '',
  name: '',
  isMnemonicBackedUp: undefined,
  isUnlocked: false,
  metadataRestored: false
}

const resetState = () => initialState

const walletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    mnemonicBackedUp: (state) => {
      state.isMnemonicBackedUp = true
    },
    metadataRestored: (state) => {
      state.metadataRestored = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletNameChanged, (state, { payload: name }) => {
        state.name = name
      })
      .addCase(appBecameInactive, (state) => {
        state.isUnlocked = false
      })
    builder.addMatcher(isAnyOf(appReset, walletDeleted), resetState)
    builder.addMatcher(
      isAnyOf(walletUnlocked, newWalletGenerated, newWalletImportedWithMetadata, appLaunchedWithLastUsedWallet),
      (state, { payload: { name, id, isMnemonicBackedUp } }) => ({
        ...state,
        id,
        name,
        isMnemonicBackedUp
      })
    )
    builder.addMatcher(isAnyOf(walletUnlocked, newWalletGenerated, newWalletImportedWithMetadata), (state) => {
      state.isUnlocked = true
    })
  }
})

export const { mnemonicBackedUp, metadataRestored } = walletSlice.actions

export default walletSlice
