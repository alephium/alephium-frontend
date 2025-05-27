import {
  activeWalletDeleted,
  appBecameInactive,
  appLaunchedWithLastUsedWallet,
  appReset,
  walletUnlockedMobile
} from '@alephium/shared'
import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import { newWalletGenerated, newWalletImportedWithMetadata, walletNameChanged } from '~/store/wallet/walletActions'
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
    builder.addMatcher(isAnyOf(appReset, activeWalletDeleted), resetState)
    builder.addMatcher(
      isAnyOf(walletUnlockedMobile, newWalletGenerated, newWalletImportedWithMetadata, appLaunchedWithLastUsedWallet),
      (state, { payload: { name, id, isMnemonicBackedUp } }) => ({
        ...state,
        id,
        name,
        isMnemonicBackedUp
      })
    )
    builder.addMatcher(isAnyOf(walletUnlockedMobile, newWalletGenerated, newWalletImportedWithMetadata), (state) => {
      state.isUnlocked = true
    })
  }
})

export const { mnemonicBackedUp, metadataRestored } = walletSlice.actions

export default walletSlice
