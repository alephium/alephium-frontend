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

import addressDiscoverySlice from '~/store/addressDiscoverySlice'
import contactsSlice from '~/store/addresses/contactsSlice'
import addressesSlice from '~/store/addressesSlice'
import appSlice from '~/store/appSlice'
import confirmedTransactionsSlice from '~/store/confirmedTransactionsSlice'
import credentialsSlice from '~/store/credentialsSlice'
import loadersSlice from '~/store/loadersSlice'
import pendingTransactionsSlice from '~/store/pendingTransactionsSlice'
import settingsSlice, { settingsListenerMiddleware } from '~/store/settingsSlice'
import walletSlice from '~/store/wallet/walletSlice'
import walletGenerationSlice from '~/store/walletGenerationSlice'

export const store = configureStore({
  reducer: {
    ...sharedReducer,
    walletGeneration: walletGenerationSlice.reducer,
    settings: settingsSlice.reducer,
    credentials: credentialsSlice.reducer,
    [walletSlice.name]: walletSlice.reducer,
    addresses: addressesSlice.reducer,
    app: appSlice.reducer,
    addressDiscovery: addressDiscoverySlice.reducer,
    confirmedTransactions: confirmedTransactionsSlice.reducer,
    pendingTransactions: pendingTransactionsSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [loadersSlice.name]: loadersSlice.reducer
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false
    }).prepend(settingsListenerMiddleware.middleware)

    return middlewares
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
