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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Mnemonic } from '../types/wallet'

const sliceName = 'walletGeneration'

export type WalletGenerationMethod = 'create' | 'import'

interface WalletGenerationState {
  method: WalletGenerationMethod
  importedMnemonic: Mnemonic
}

const initialState: WalletGenerationState = {
  method: 'create',
  importedMnemonic: ''
}

const walletGenerationSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    methodSelected: (state, action: PayloadAction<WalletGenerationMethod>) => {
      state.method = action.payload
    },
    importedMnemonicChanged: (state, action: PayloadAction<Mnemonic>) => {
      state.importedMnemonic = action.payload
    },
    flushImportedMnemonic: (state) => {
      state.importedMnemonic = ''
    }
  }
})

export const { methodSelected, importedMnemonicChanged, flushImportedMnemonic } = walletGenerationSlice.actions

export default walletGenerationSlice
