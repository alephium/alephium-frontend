import { createAction } from '@reduxjs/toolkit'

import { Address, AddressBase, AddressHash, AddressSettings, Contact } from '@/types/addresses'

export const syncingAddressDataStarted = createAction('addresses/syncingAddressDataStarted')

export const contactStoredInPersistentStorage = createAction<Contact>('contacts/contactStoredInPersistentStorage')

export const contactDeletedFromPersistentStorage = createAction<Contact['id']>(
  'contacts/contactDeletedFromPersistentStorage'
)

export const addressSettingsSaved = createAction<{ addressHash: AddressHash; settings: AddressSettings }>(
  'addresses/addressSettingsSaved'
)

export const addressesRestoredFromMetadata = createAction<AddressBase[]>('addresses/addressesRestoredFromMetadata')

export const addressRestorationStarted = createAction('addresses/addressRestorationStarted')

export const newAddressesSaved = createAction<AddressBase[]>('addresses/newAddressesSaved')

export const addressDeleted = createAction<AddressHash>('addresses/addressDeleted')

export const defaultAddressChanged = createAction<Address>('addresses/defaultAddressChanged')
