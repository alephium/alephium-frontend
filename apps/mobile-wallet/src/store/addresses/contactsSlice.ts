import {
  Contact,
  contactDeletedFromPersistentStorage,
  contactsAdapter,
  contactStoredInPersistentStorage
} from '@alephium/shared'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { walletDeleted, walletUnlocked } from '~/store/wallet/walletActions'

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
