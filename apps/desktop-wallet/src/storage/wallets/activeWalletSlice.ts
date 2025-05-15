import {
  activeWalletDeleted,
  ActiveWalletDesktop,
  walletLocked,
  walletSwitchedDesktop,
  walletUnlockedDesktop
} from '@alephium/shared'
import { createSlice } from '@reduxjs/toolkit'

import { newWalletNameStored, walletSaved } from '@/storage/wallets/walletActions'

type ActiveWalletState = Partial<ActiveWalletDesktop>

const initialState: ActiveWalletState = {
  id: undefined,
  name: undefined,
  isPassphraseUsed: false,
  isLedger: false
}

const activeWalletSlice = createSlice({
  name: 'activeWallet',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletSaved, (_, action) => action.payload)
      .addCase(walletUnlockedDesktop, (_, action) => action.payload)
      .addCase(walletSwitchedDesktop, (_, action) => action.payload)
      .addCase(walletLocked, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(newWalletNameStored, (state, action) => {
        state.name = action.payload
      })
  }
})

export default activeWalletSlice

// Reducers helper functions

const resetState = () => initialState
