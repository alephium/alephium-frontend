import {
  activeWalletDeleted,
  contactDeletedFromPersistentStorage,
  contactsAdapter,
  contactStoredInPersistentStorage,
  walletLocked,
  walletSwitchedDesktop
} from '@alephium/shared/store'
import { Contact } from '@alephium/shared/types'
import { createSlice, EntityState } from '@reduxjs/toolkit'

import { contactsLoadedFromPersistentStorage } from '@/storage/addresses/addressesActions'

type ContactsState = EntityState<Contact>

const initialState: ContactsState = contactsAdapter.getInitialState()

// TODO: Move to shared
const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletLocked, resetState)
      .addCase(walletSwitchedDesktop, resetState)
      .addCase(activeWalletDeleted, resetState)
      .addCase(contactStoredInPersistentStorage, contactsAdapter.upsertOne)
      .addCase(contactsLoadedFromPersistentStorage, contactsAdapter.setAll)
      .addCase(contactDeletedFromPersistentStorage, contactsAdapter.removeOne)
  }
})

export default contactsSlice

// Reducers helper functions

const resetState = () => initialState
