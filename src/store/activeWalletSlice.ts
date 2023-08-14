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

import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { appBecameInactive, appReset } from '~/store/appSlice'
import { newWalletGenerated, newWalletImportedWithMetadata } from '~/store/wallet/walletActions'
import { ActiveWalletState, WalletUnlockedPayload } from '~/types/wallet'

const sliceName = 'activeWallet'

const initialState: ActiveWalletState = {
  name: '',
  mnemonic: '',
  isMnemonicBackedUp: undefined,
  metadataId: '',
  authType: undefined
}

const resetState = () => initialState

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    biometricsEnabled: (state) => {
      state.authType = 'biometrics'
    },
    biometricsDisabled: (state) => {
      state.authType = 'pin'
    },
    mnemonicBackedUp: (state) => {
      state.isMnemonicBackedUp = true
    },
    walletDeleted: resetState,
    walletSwitched: (_, action: PayloadAction<WalletUnlockedPayload>) => action.payload.wallet,
    walletUnlocked: (_, action: PayloadAction<WalletUnlockedPayload>) => action.payload.wallet
  },
  extraReducers: (builder) => {
    builder.addCase(appBecameInactive, resetState).addCase(appReset, resetState)
    builder.addMatcher(isAnyOf(newWalletGenerated, newWalletImportedWithMetadata), (state, action) => {
      const { name, mnemonic, metadataId, isMnemonicBackedUp } = action.payload

      return {
        name,
        mnemonic,
        authType: 'pin',
        metadataId,
        isMnemonicBackedUp
      }
    })
  }
})

export const {
  biometricsEnabled,
  biometricsDisabled,
  mnemonicBackedUp,
  walletDeleted,
  walletSwitched,
  walletUnlocked
} = activeWalletSlice.actions

export default activeWalletSlice
