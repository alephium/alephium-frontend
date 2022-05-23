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

import { walletEncrypt, walletImport } from '@alephium/sdk'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { storeWallet } from '../storage/wallets'
import { Mnemonic, StoredWalletAuthType } from '../types/wallet'
import { RootState } from './store'
import { loadingFinished, loadingStarted } from './walletGenerationSlice'

const sliceName = 'activeWallet'

export interface ActiveWalletState {
  name: string
  mnemonic: Mnemonic
  authType: StoredWalletAuthType | null
  metadataId: string | null
}

const initialState: ActiveWalletState = {
  name: '',
  mnemonic: '',
  authType: null,
  metadataId: null
}

export const walletStored = createAsyncThunk(
  `${sliceName}/walletStored`,
  async (payload: Omit<ActiveWalletState, 'metadataId'>, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const { name, mnemonic, authType } = payload
    let hasError = false
    let metadataId: string

    try {
      if (!name) throw 'Could not store wallet, wallet name is not set'
      if (!mnemonic) throw 'Could not store wallet, mnemonic not set'

      // Check if mnemonic is valid
      walletImport(mnemonic)

      if (authType === 'biometrics') {
        metadataId = await storeWallet(name, mnemonic, authType)
      } else if (authType === 'pin') {
        const state = getState() as RootState
        const pin = state.credentials.pin
        if (!pin) throw 'Could not store wallet, pin to encrypt it is not set'

        const encryptedWallet = walletEncrypt(pin, mnemonic)
        metadataId = await storeWallet(name, encryptedWallet, authType)
      }
    } catch (e) {
      console.error(e)
      hasError = true
    }

    return new Promise<ActiveWalletState>((resolve, reject) => {
      dispatch(loadingFinished())

      if (hasError) {
        reject(new Error('Could not store wallet'))
      } else {
        resolve({
          name,
          mnemonic,
          authType,
          metadataId
        } as ActiveWalletState)
      }
    })
  }
)

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletFlushed: () => {
      return initialState
    },
    walletChanged: (state, action: PayloadAction<ActiveWalletState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(walletStored.fulfilled, (state, action) => {
      return action.payload
    })
  }
})

export const { walletChanged, walletFlushed } = activeWalletSlice.actions

export default activeWalletSlice
