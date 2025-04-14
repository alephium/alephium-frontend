import { AddressHash, contactsAdapter } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '~/store/store'

// Same as in desktop wallet
export const { selectAll: selectAllContacts, selectById: selectContactById } = contactsAdapter.getSelectors<RootState>(
  (state) => state.contacts
)

export const selectContactByHash = createSelector(
  [selectAllContacts, (_, addressHash: AddressHash) => addressHash],
  (contacts, addressHash) => contacts.find((contact) => contact.address === addressHash)
)
