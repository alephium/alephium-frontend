import { activeWalletDeleted, appReset } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  addFavoriteDApp,
  favoriteDAppsLoadedFromStorage,
  loadFavoriteDApps,
  removeFavoriteDApp,
  setFavoriteDApps
} from '~/features/ecosystem/favoriteDApps/favoriteDAppsActions'
import { storeFavoriteDApps } from '~/features/ecosystem/favoriteDApps/favoriteDAppsStorage'
import { RootState } from '~/store/store'

const sliceName = 'favoriteDApps'

export interface FavoriteDAppsState {
  dAppNames: string[]
  loadedFromStorage: boolean
}

const initialState: FavoriteDAppsState = {
  dAppNames: [],
  loadedFromStorage: false
}

const resetState = () => initialState

const favoriteDAppsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(favoriteDAppsLoadedFromStorage, (state, action) => {
        state.dAppNames = action.payload
        state.loadedFromStorage = true
      })
      .addCase(setFavoriteDApps, (state, action) => {
        state.dAppNames = action.payload
      })
      .addCase(addFavoriteDApp, (state, action) => {
        if (!state.dAppNames.includes(action.payload)) {
          state.dAppNames.push(action.payload)
        }
      })
      .addCase(removeFavoriteDApp, (state, action) => {
        state.dAppNames = state.dAppNames.filter((name) => name !== action.payload)
      })
      .addCase(loadFavoriteDApps, (state, action) => {
        state.dAppNames = action.payload
      })
      .addCase(appReset, resetState)
      .addCase(activeWalletDeleted, resetState)
  }
})

export const favoriteDAppsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
favoriteDAppsListenerMiddleware.startListening({
  matcher: isAnyOf(
    setFavoriteDApps,
    addFavoriteDApp,
    removeFavoriteDApp,
    loadFavoriteDApps,
    activeWalletDeleted,
    appReset
  ),
  effect: async (_, { getState }) => {
    const state = (getState() as RootState)[sliceName]

    if (state.loadedFromStorage) storeFavoriteDApps(state.dAppNames)
  }
})

export default favoriteDAppsSlice
