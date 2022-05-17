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
import { createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { storeEncryptedWallet } from '../storage/wallets'
import { Mnemonic } from '../types/wallet'
import { addressAdded } from './addressesSlice'
import { RootState } from './store'

const sliceName = 'activeWallet'

interface ActiveWalletState {
  name: string
  mnemonic: string
}

const initialState: ActiveWalletState = {
  name: '',
  mnemonic: ''
}

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletNameChanged: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    walletFlushed: () => {
      return {
        ...initialState
      }
    },
    mnemonicChanged: (state, action: PayloadAction<Mnemonic>) => {
      const mnemomic = action.payload
      try {
        walletImport(mnemomic)
        state.mnemonic = mnemomic
      } catch (e) {
        console.log(e)
      }
    }
  }
})

export const { walletNameChanged, walletFlushed, mnemonicChanged } = activeWalletSlice.actions

export const activeWalletListenerMiddleware = createListenerMiddleware()

// When the mnemomic changes, store it in persistent storage
activeWalletListenerMiddleware.startListening({
  actionCreator: mnemonicChanged,
  effect: async (action, { getState, dispatch }) => {
    const state = getState() as RootState
    if (!state.activeWallet.mnemonic) return

    try {
      const wallet = walletImport(action.payload)
      const pin = state.credentials.pin

      if (pin) {
        const encryptedWallet = walletEncrypt(pin.toString(), action.payload)
        await storeEncryptedWallet(state.activeWallet.name, encryptedWallet)
      } else {
        console.error('Could not encrypt wallet, no PIN set')
      }

      console.log('dispatching addressAdded...')
      dispatch(
        addressAdded({
          hash: wallet.address,
          publicKey: wallet.publicKey,
          privateKey: wallet.privateKey,
          index: 0,
          settings: {
            isMain: true
          }
        })
      )
    } catch (e) {
      console.log(e)
    }
  }
})

export default activeWalletSlice
