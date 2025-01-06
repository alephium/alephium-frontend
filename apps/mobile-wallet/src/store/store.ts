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

import { sharedReducer } from '@alephium/shared'
import { configureStore } from '@reduxjs/toolkit'
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin'

import backupSlice from '~/features/backup/backupSlice'
import fundPasswordSlice from '~/features/fund-password/fundPasswordSlice'
import modalSlice from '~/features/modals/modalSlice'
import settingsSlice, { settingsListenerMiddleware } from '~/features/settings/settingsSlice'
import addressDiscoverySlice from '~/store/addressDiscoverySlice'
import contactsSlice from '~/store/addresses/contactsSlice'
import addressesSlice from '~/store/addressesSlice'
import appSlice from '~/store/appSlice'
import confirmedTransactionsSlice from '~/store/confirmedTransactionsSlice'
import loadersSlice from '~/store/loadersSlice'
import pendingTransactionsSlice from '~/store/pendingTransactionsSlice'
import walletSlice from '~/store/wallet/walletSlice'
import walletGenerationSlice from '~/store/walletGenerationSlice'

export const store = configureStore({
  reducer: {
    ...sharedReducer,
    [walletGenerationSlice.name]: walletGenerationSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [walletSlice.name]: walletSlice.reducer,
    [addressesSlice.name]: addressesSlice.reducer,
    [appSlice.name]: appSlice.reducer,
    [addressDiscoverySlice.name]: addressDiscoverySlice.reducer,
    [confirmedTransactionsSlice.name]: confirmedTransactionsSlice.reducer,
    [pendingTransactionsSlice.name]: pendingTransactionsSlice.reducer,
    [backupSlice.name]: backupSlice.reducer,
    [fundPasswordSlice.name]: fundPasswordSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [loadersSlice.name]: loadersSlice.reducer,
    [modalSlice.name]: modalSlice.reducer
  },
  devTools: false,
  enhancers: (enhancers) => [...enhancers, devToolsEnhancer()],
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false
    }).prepend(settingsListenerMiddleware.middleware)

    return middlewares
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
