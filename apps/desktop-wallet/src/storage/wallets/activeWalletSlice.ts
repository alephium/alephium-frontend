import { createSlice } from '@reduxjs/toolkit'

import {
  activeWalletDeleted,
  newWalletNameStored,
  walletLocked,
  walletSaved,
  walletSwitched,
  walletUnlocked
} from '@/storage/wallets/walletActions'
import { ActiveWallet } from '@/types/wallet'

type ActiveWalletState = Partial<ActiveWallet>

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
      .addCase(walletSaved, (_, action) => action.payload.wallet)
      .addCase(walletUnlocked, (_, action) => action.payload.wallet)
      .addCase(walletSwitched, (_, action) => action.payload.wallet)
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
