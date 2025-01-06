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
