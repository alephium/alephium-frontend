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

import { createEntityAdapter, createSlice, EntityState, isAnyOf } from '@reduxjs/toolkit'

import { appBecameInactive, appReset } from '~/store/appSlice'
import { RootState } from '~/store/store'
import {
  loadedDecryptedWallets,
  newWalletGenerated,
  newWalletImportedWithMetadata,
  walletDeleted
} from '~/store/wallet/walletActions'
import { SimpleWallet } from '~/types/wallet'

const sliceName = 'wallets'

interface WalletsState extends EntityState<SimpleWallet> {}

const walletsAdapter = createEntityAdapter<SimpleWallet>()

const initialState: WalletsState = walletsAdapter.getInitialState()

const resetState = () => initialState

const walletsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletDeleted, (state, { payload: id }) => walletsAdapter.removeOne(state, id))
      .addCase(loadedDecryptedWallets, walletsAdapter.setAll)
    builder.addMatcher(isAnyOf(appBecameInactive, appReset), resetState)
    builder.addMatcher(
      isAnyOf(newWalletGenerated, newWalletImportedWithMetadata),
      (state, { payload: { id, mnemonic } }) => walletsAdapter.addOne(state, { id, mnemonic })
    )
  }
})

export const { selectAll: selectAllWallets, selectById: selectWalletById } = walletsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export default walletsSlice
