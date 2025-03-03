import { appReset } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'

import { hiddenTokensLoadedFromStorage, hideToken, unhideToken } from '@/features/hiddenTokens/hiddenTokensActions'
import { hiddenTokensStorage } from '@/features/hiddenTokens/hiddenTokensPersistentStorage'
import { RootState } from '@/storage/store'
import { walletDeleted } from '@/storage/wallets/walletActions'
import { TokenId } from '@/types/tokens'

const sliceName = 'hiddenTokens'

export interface hiddenTokensState {
  hiddenTokensIds: Array<TokenId>
  loadedFromStorage: boolean
}

const initialState: hiddenTokensState = {
  hiddenTokensIds: [],
  loadedFromStorage: false
}

const resetState = () => initialState

const hiddenTokensSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hiddenTokensLoadedFromStorage, (state, action) => {
        state.hiddenTokensIds = action.payload
        state.loadedFromStorage = true
      })
      .addCase(hideToken, (state, action) => {
        if (!state.hiddenTokensIds.includes(action.payload)) {
          state.hiddenTokensIds.push(action.payload)
        }
      })
      .addCase(unhideToken, (state, action) => {
        state.hiddenTokensIds = state.hiddenTokensIds.filter((id) => id !== action.payload)
      })
      .addCase(appReset, resetState)
      .addCase(walletDeleted, resetState)
  }
})

export default hiddenTokensSlice

export const hiddenTokensListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
hiddenTokensListenerMiddleware.startListening({
  matcher: isAnyOf(hideToken, unhideToken, walletDeleted, appReset),
  effect: (_, { getState }) => {
    const state = getState() as RootState
    const walletId = state.activeWallet.id
    const hiddenTokensState = state[sliceName]

    if (hiddenTokensState.loadedFromStorage && walletId) {
      try {
        hiddenTokensStorage.store(walletId, hiddenTokensState.hiddenTokensIds)
      } catch (error) {
        console.error(error)
      }
    }
  }
})
