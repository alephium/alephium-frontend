import { appReset } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  hiddenAssetsLoadedFromStorage,
  hideAsset,
  unhideAsset
} from '~/features/assetsDisplay/hideAssets/hiddenAssetsActions'
import { storeHiddenAssetsIds } from '~/features/assetsDisplay/hideAssets/hiddenAssetsStorage'
import { RootState } from '~/store/store'
import { walletDeleted } from '~/store/wallet/walletActions'

const sliceName = 'hiddenAssets'

export interface hiddenAssetsState {
  hiddenAssetsIds: Token['id'][]
  loadedFromStorage: boolean
}

const initialState: hiddenAssetsState = {
  hiddenAssetsIds: [],
  loadedFromStorage: false
}

const resetState = () => initialState

const hiddenAssetsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hiddenAssetsLoadedFromStorage, (state, action) => {
        state.hiddenAssetsIds = action.payload
        state.loadedFromStorage = true
      })
      .addCase(hideAsset, (state, action) => {
        if (!state.hiddenAssetsIds.includes(action.payload)) {
          state.hiddenAssetsIds.push(action.payload)
        }
      })
      .addCase(unhideAsset, (state, action) => {
        state.hiddenAssetsIds = state.hiddenAssetsIds.filter((id) => id !== action.payload)
      })
      .addCase(appReset, resetState)
      .addCase(walletDeleted, resetState)
  }
})

export const hiddenAssetsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
hiddenAssetsListenerMiddleware.startListening({
  matcher: isAnyOf(hiddenAssetsLoadedFromStorage, hideAsset, unhideAsset, appReset, walletDeleted),
  effect: async (_, { getState }) => {
    const state = (getState() as RootState)[sliceName]

    if (state.loadedFromStorage) storeHiddenAssetsIds(state.hiddenAssetsIds)
  }
})

export default hiddenAssetsSlice
