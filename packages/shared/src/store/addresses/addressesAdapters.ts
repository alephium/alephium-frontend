import { createEntityAdapter } from '@reduxjs/toolkit'

import { Contact } from '@/types/addresses'

export const contactsAdapter = createEntityAdapter<Contact>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})
