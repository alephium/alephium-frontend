import {
  activeWalletDeleted,
  Contact,
  contactDeletedFromPersistentStorage,
  contactsAdapter,
  contactStoredInPersistentStorage,
  walletUnlockedMobile
} from '@alephium/shared'
import { createSlice, EntityState } from '@reduxjs/toolkit'

type ContactsState = EntityState<Contact>

const initialState: ContactsState = contactsAdapter.getInitialState()

// TODO: Move to shared
export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletUnlockedMobile, (state, action) => contactsAdapter.setAll(state, action.payload.contacts))
      .addCase(contactStoredInPersistentStorage, contactsAdapter.upsertOne)
      .addCase(contactDeletedFromPersistentStorage, contactsAdapter.removeOne)
      .addCase(activeWalletDeleted, resetState)
  }
})

export default contactsSlice

// Reducers helper functions

const resetState = () => initialState
