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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { appBecameInactive, appReset } from '~/store/appSlice'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { CredentialsState } from '~/types/wallet'

const sliceName = 'credentials'

const initialState: CredentialsState = {
  pin: undefined
}

const resetState = () => initialState

const credentialsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    newPinVerified: (state, action: PayloadAction<CredentialsState['pin']>) => {
      state.pin = action.payload
    }
  },
  extraReducers(builder) {
    builder
      .addCase(appBecameInactive, resetState)
      .addCase(appReset, resetState)
      .addCase(walletUnlocked, (state, action) => {
        if (action.payload.pin) state.pin = action.payload.pin
      })
  }
})

export const { newPinVerified } = credentialsSlice.actions

export default credentialsSlice
