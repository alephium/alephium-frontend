import {
  activeWalletDeleted,
  customNetworkSettingsSaved,
  localStorageNetworkSettingsMigrated,
  networkPresetSwitched,
  nodeApiClientInitFailed,
  nodeApiClientInitSucceeded,
  walletLocked
} from '@alephium/shared'
import { createSelector, createSlice, isAnyOf } from '@reduxjs/toolkit'

import { languageChangeFinished, languageChangeStarted } from '@/features/localization/localizationActions'
import { themeSettingsChanged } from '@/features/settings/settingsActions'
import { ThemeType } from '@/features/theme/themeTypes'
import { getThemeType } from '@/features/theme/themeUtils'
import { addressDiscoveryFinished, addressDiscoveryStarted } from '@/storage/addresses/addressesActions'
import {
  devModeShortcutDetected,
  modalClosed,
  modalOpened,
  osThemeChangeDetected,
  receiveFaucetTokens,
  toggleAppLoading
} from '@/storage/global/globalActions'
import { RootState } from '@/storage/store'
import { newWalletNameStored, walletDeleted, walletSaved } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { StoredEncryptedWallet } from '@/types/wallet'

interface AppState {
  loading: boolean
  visibleModals: string[]
  wallets: StoredEncryptedWallet[]
  theme: ThemeType
  devMode: boolean
  faucetCallPending: boolean
}

const initialState: AppState = {
  loading: false,
  visibleModals: [],
  wallets: walletStorage.list(),
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
      .addCase(toggleAppLoading, (state, action) => toggleLoading(state, action.payload))
      .addCase(walletSaved, (state, action) => {
        const { id, name, encrypted, lastUsed } = action.payload

        state.wallets.push({ id, name, encrypted, lastUsed, isLedger: false })
      })
      .addCase(walletLocked, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(themeSettingsChanged, (state, action) => {
        const theme = action.payload
        if (theme !== 'system') state.theme = theme
      })
      .addCase(localStorageNetworkSettingsMigrated, refreshWalletList)
      .addCase(newWalletNameStored, refreshWalletList)
      .addCase(receiveFaucetTokens.pending, (state) => {
        state.faucetCallPending = true
      })
      .addCase(receiveFaucetTokens.fulfilled, (state) => {
        state.faucetCallPending = false
      })
      .addCase(receiveFaucetTokens.rejected, (state) => {
        state.faucetCallPending = false
      })

    builder
      .addMatcher(isAnyOf(networkPresetSwitched, customNetworkSettingsSaved), (state) => {
        toggleLoading(state, true)
      })
      .addMatcher(isAnyOf(nodeApiClientInitSucceeded, nodeApiClientInitFailed), (state) => {
        toggleLoading(state, false)
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

const resetState = ({ theme }: AppState) => ({ ...initialState, wallets: walletStorage.list(), theme })

const refreshWalletList = (state: AppState) => {
  state.wallets = walletStorage.list()
}
