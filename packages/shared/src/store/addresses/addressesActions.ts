import { createAction } from '@reduxjs/toolkit'

import { Contact } from '@/types/addresses'

export const syncingAddressDataStarted = createAction('addresses/syncingAddressDataStarted')

export const contactStoredInPersistentStorage = createAction<Contact>('contacts/contactStoredInPersistentStorage')

export const contactDeletedFromPersistentStorage = createAction<Contact['id']>(
  'contacts/contactDeletedFromPersistentStorage'
)
