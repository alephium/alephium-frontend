import { contactsAdapter } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/storage/store'

export const { selectAll: selectAllContacts, selectById: selectContactByHash } =
  contactsAdapter.getSelectors<RootState>((state) => state.contacts)

export const makeSelectContactByAddress = () =>
  createSelector([selectAllContacts, (_, addressHash) => addressHash], (contacts, addressHash) =>
    contacts.find((contact) => contact.address === addressHash)
  )
