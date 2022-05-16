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
import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'

import { Mnemonic } from '../types/wallet'
import { RootState } from './store'

const name = 'activeWallet'

interface ActiveWalletState {
  name: string
  primaryAddress: string
  publicKey: string
  privateKey: string
  mnemonic: string
}

const initialState: ActiveWalletState = {
  name: '',
  primaryAddress: '',
  publicKey: '',
  privateKey: '',
  mnemonic: ''
}

const activeWalletSlice = createSlice({
  name,
  initialState,
  reducers: {
    nameChanged: (state, action) => {
      state.name = action.payload
    },
    walletFlushed: (state) => {
      state.name = ''
      state.primaryAddress = ''
      state.publicKey = ''
      state.privateKey = ''
      state.mnemonic = ''
    },
    mnemonicChanged: (state, action: PayloadAction<Mnemonic>) => {
      try {
        const wallet = walletImport(action.payload)
        state.mnemonic = action.payload
        state.primaryAddress = wallet.address
        state.publicKey = wallet.publicKey
        state.privateKey = wallet.privateKey
      } catch (e) {
        console.log(e)
      }
    }
  }
})

export const { nameChanged, walletFlushed, mnemonicChanged } = activeWalletSlice.actions

export const activeWalletListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
activeWalletListenerMiddleware.startListening({
  matcher: isAnyOf(mnemonicChanged),
  effect: async (action, { getState }) => {
    const state = getState() as RootState
    const pin = state.security.pin
    const walletName = state.activeWallet.name.replaceAll(' ', '-')

    if (pin) {
      const encryptedWallet = walletEncrypt(pin.toString(), action.payload)
      // TODO: Remove accountName from the key and use an index instead
      // Make sure wallets do not get overriden by other wallets
      await SecureStore.setItemAsync(`wallet-${walletName}`, encryptedWallet)
    } else {
      console.error('Could not encrypt wallet, no PIN set')
    }
  }
})

export default activeWalletSlice
