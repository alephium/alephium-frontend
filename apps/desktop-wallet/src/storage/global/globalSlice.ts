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

import { localStorageNetworkSettingsMigrated } from '@alephium/shared'
import { createSelector, createSlice } from '@reduxjs/toolkit'

import { addressDiscoveryFinished, addressDiscoveryStarted } from '@/storage/addresses/addressesActions'
import {
  addressesPageInfoMessageClosed,
  devModeShortcutDetected,
  modalClosed,
  modalOpened,
  osThemeChangeDetected,
  receiveTestnetTokens,
  transfersPageInfoMessageClosed
} from '@/storage/global/globalActions'
import {
  languageChangeFinished,
  languageChangeStarted,
  themeSettingsChanged,
  themeToggled
} from '@/storage/settings/settingsActions'
import { RootState } from '@/storage/store'
import {
  activeWalletDeleted,
  newWalletNameStored,
  walletDeleted,
  walletLocked,
  walletSaved
} from '@/storage/wallets/walletActions'
import WalletStorage from '@/storage/wallets/walletPersistentStorage'
import { ThemeType } from '@/types/settings'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getThemeType } from '@/utils/settings'

interface AppState {
  loading: boolean
  visibleModals: string[]
  addressesPageInfoMessageClosed: boolean
  transfersPageInfoMessageClosed: boolean
  wallets: StoredEncryptedWallet[]
  theme: ThemeType
  devMode: boolean
  faucetCallPending: boolean
}

const initialState: AppState = {
  loading: false,
  visibleModals: [],
  addressesPageInfoMessageClosed: true, // See: https://github.com/alephium/desktop-wallet/issues/644
  transfersPageInfoMessageClosed: true, // See: https://github.com/alephium/desktop-wallet/issues/644
  wallets: WalletStorage.list(),
  theme: getThemeType(),
  devMode: false,
  faucetCallPending: false
}

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(modalOpened, (state, action) => {
        const modalId = action.payload

        state.visibleModals.push(modalId)
      })
      .addCase(modalClosed, (state) => {
        state.visibleModals.pop()
      })
      .addCase(addressesPageInfoMessageClosed, (state) => {
        state.addressesPageInfoMessageClosed = true
      })
      .addCase(transfersPageInfoMessageClosed, (state) => {
        state.transfersPageInfoMessageClosed = true
      })
      .addCase(walletDeleted, (state, action) => {
        const deletedWalletId = action.payload

        state.wallets = state.wallets.filter(({ id }) => id !== deletedWalletId)
      })
      .addCase(osThemeChangeDetected, (state, action) => {
        state.theme = action.payload
      })
      .addCase(devModeShortcutDetected, (state, action) => {
        state.devMode = action.payload.activate
      })
      .addCase(addressDiscoveryStarted, (state, action) => toggleLoading(state, true, action.payload))
      .addCase(addressDiscoveryFinished, (state, action) => toggleLoading(state, false, action.payload))
      .addCase(languageChangeStarted, (state) => toggleLoading(state, true, true))
      .addCase(languageChangeFinished, (state) => toggleLoading(state, false, true))
      .addCase(walletSaved, (state, action) => {
        const { id, name, encrypted, lastUsed } = action.payload.wallet

        state.wallets.push({ id, name, encrypted, lastUsed })
      })
      .addCase(walletLocked, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(themeSettingsChanged, (state, action) => {
        const theme = action.payload
        if (theme !== 'system') state.theme = theme
      })
      .addCase(themeToggled, (state, action) => {
        state.theme = action.payload
      })
      .addCase(localStorageNetworkSettingsMigrated, refreshWalletList)
      .addCase(newWalletNameStored, refreshWalletList)
      .addCase(receiveTestnetTokens.pending, (state) => {
        state.faucetCallPending = true
      })
      .addCase(receiveTestnetTokens.fulfilled, (state) => {
        state.faucetCallPending = false
      })
      .addCase(receiveTestnetTokens.rejected, (state) => {
        state.faucetCallPending = false
      })
  }
})

export const selectDevModeStatus = createSelector(
  (s: RootState) => s.global.devMode,
  (devMode) => devMode && import.meta.env.DEV
)

export default globalSlice

// Reducers helper functions

const toggleLoading = (state: AppState, toggle: boolean, enableLoading?: boolean) => {
  if (enableLoading !== false) state.loading = toggle
}

const resetState = ({ theme }: AppState) => ({ ...initialState, wallets: WalletStorage.list(), theme })

const refreshWalletList = (state: AppState) => {
  state.wallets = WalletStorage.list()
}
