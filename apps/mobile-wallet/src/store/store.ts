import { sharedReducer } from '@alephium/shared'
import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin'

import hiddenTokensListenerMiddleware from '~/features/assetsDisplay/hideTokens/hiddenTokensMiddleware'
import backupSlice from '~/features/backup/backupSlice'
import favoriteDAppsSlice, { favoriteDAppsListenerMiddleware } from '~/features/ecosystem/favoriteDAppsSlice'
import fundPasswordSlice from '~/features/fund-password/fundPasswordSlice'
import loaderSlice from '~/features/loader/loaderSlice'
import modalSlice from '~/features/modals/modalSlice'
import settingsSlice, { settingsListenerMiddleware } from '~/features/settings/settingsSlice'
import addressDiscoverySlice from '~/store/addressDiscoverySlice'
import contactsSlice from '~/store/addresses/contactsSlice'
import appSlice from '~/store/appSlice'
import walletSlice from '~/store/wallet/walletSlice'
import walletGenerationSlice from '~/store/walletGenerationSlice'

export const store = configureStore({
  reducer: {
    ...sharedReducer,
    [walletGenerationSlice.name]: walletGenerationSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [walletSlice.name]: walletSlice.reducer,
    [appSlice.name]: appSlice.reducer,
    [loaderSlice.name]: loaderSlice.reducer,
    [addressDiscoverySlice.name]: addressDiscoverySlice.reducer,
    [backupSlice.name]: backupSlice.reducer,
    [fundPasswordSlice.name]: fundPasswordSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [modalSlice.name]: modalSlice.reducer,
    [favoriteDAppsSlice.name]: favoriteDAppsSlice.reducer
  },
  devTools: false,
  enhancers: (enhancers) => [...enhancers, devToolsEnhancer()],
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false
    })
      .prepend(settingsListenerMiddleware.middleware)
      .prepend(favoriteDAppsListenerMiddleware.middleware)
      .prepend(hiddenTokensListenerMiddleware.middleware)

    return middlewares
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
