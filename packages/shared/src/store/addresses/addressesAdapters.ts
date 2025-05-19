import { createEntityAdapter } from '@reduxjs/toolkit'

import { Address, Contact } from '@/types/addresses'

export const contactsAdapter = createEntityAdapter<Contact>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

export const addressesAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash
})
