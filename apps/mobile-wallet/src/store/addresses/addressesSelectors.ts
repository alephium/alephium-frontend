import { contactsAdapter } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
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
