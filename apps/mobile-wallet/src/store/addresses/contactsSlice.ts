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

import { createSlice, EntityState } from '@reduxjs/toolkit'

import {
  contactDeletedFromPersistentStorage,
  contactStoredInPersistentStorage
} from '~/store/addresses/addressesActions'
import { contactsAdapter } from '~/store/addresses/addressesAdapter'
import { walletDeleted } from '~/store/wallet/walletActions'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { Contact } from '~/types/contacts'

type ContactsState = EntityState<Contact>

const initialState: ContactsState = contactsAdapter.getInitialState()

export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletUnlocked, (state, action) => contactsAdapter.setAll(state, action.payload.contacts))
      .addCase(contactStoredInPersistentStorage, contactsAdapter.upsertOne)
      .addCase(contactDeletedFromPersistentStorage, contactsAdapter.removeOne)
      .addCase(walletDeleted, resetState)
  }
})

export default contactsSlice

// Reducers helper functions

const resetState = () => initialState
