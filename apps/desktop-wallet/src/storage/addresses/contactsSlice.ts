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

import {
  Contact,
  contactDeletedFromPersistentStorage,
  contactsAdapter,
  contactStoredInPersistentStorage
} from '@alephium/shared'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { contactsLoadedFromPersistentStorage } from '@/storage/addresses/addressesActions'
import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/wallets/walletActions'

type ContactsState = EntityState<Contact>

const initialState: ContactsState = contactsAdapter.getInitialState()

export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletLocked, resetState)
      .addCase(walletSwitched, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(contactStoredInPersistentStorage, contactsAdapter.upsertOne)
      .addCase(contactsLoadedFromPersistentStorage, contactsAdapter.setAll)
      .addCase(contactDeletedFromPersistentStorage, contactsAdapter.removeOne)
  }
})

export default contactsSlice

// Reducers helper functions

const resetState = () => initialState
