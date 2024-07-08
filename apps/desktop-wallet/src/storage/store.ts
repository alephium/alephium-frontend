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

import { sharedMiddleware, sharedReducer } from '@alephium/shared'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

import addressesSlice from '@/storage/addresses/addressesSlice'
import contactsSlice from '@/storage/addresses/contactsSlice'
import globalSlice from '@/storage/global/globalSlice'
import snackbarSlice from '@/storage/global/snackbarSlice'
import { networkListenerMiddleware } from '@/storage/settings/networkMiddleware'
import settingsSlice, { settingsListenerMiddleware } from '@/storage/settings/settingsSlice'
import activeWalletSlice from '@/storage/wallets/activeWalletSlice'

export const store = configureStore({
  reducer: {
    ...sharedReducer,
    [globalSlice.name]: globalSlice.reducer,
    [activeWalletSlice.name]: activeWalletSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [addressesSlice.name]: addressesSlice.reducer,
    [snackbarSlice.name]: snackbarSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(settingsListenerMiddleware.middleware)
      .concat(networkListenerMiddleware.middleware)
      .concat(...sharedMiddleware)
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
