import { activeWalletDeleted, appReset, walletUnlockedMobile } from '@alephium/shared'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { newWalletImportedWithMetadata } from '~/store/wallet/walletActions'

const sliceName = 'walletGeneration'

export type WalletGenerationMethod = 'create' | 'import'

interface WalletGenerationState {
  method: WalletGenerationMethod | null
  walletName: string
  qrCodeImportedEncryptedMnemonic: string | null
}

const initialState: WalletGenerationState = {
  method: null,
  walletName: '',
  qrCodeImportedEncryptedMnemonic: ''
}

const walletGenerationSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    methodSelected: (state, action: PayloadAction<WalletGenerationMethod>) => {
      state.method = action.payload
    },
    newWalletNameEntered: (state, action: PayloadAction<string>) => {
      state.walletName = action.payload
    },
    qrCodeFromDesktopWalletScanned: (state, action: PayloadAction<string>) => {
      state.qrCodeImportedEncryptedMnemonic = action.payload
    }
  },
  extraReducers(builder) {
    builder.addCase(newWalletImportedWithMetadata, (state) => {
      state.qrCodeImportedEncryptedMnemonic = ''
    })
    builder.addMatcher(isAnyOf(appReset, walletUnlockedMobile, activeWalletDeleted), () => initialState)
  }
})

export const { methodSelected, newWalletNameEntered, qrCodeFromDesktopWalletScanned } = walletGenerationSlice.actions

export default walletGenerationSlice
