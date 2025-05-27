import { Address, AddressBase, Contact } from '@alephium/shared'
import { createAction } from '@reduxjs/toolkit'

import { Message } from '@/features/toastMessages/toastMessagesTypes'

export const addressesRestoredFromMetadata = createAction<AddressBase[]>('addresses/addressesRestoredFromMetadata')

export const addressRestorationStarted = createAction('addresses/addressRestorationStarted')

export const defaultAddressChanged = createAction<Address>('addresses/defaultAddressChanged')

export const addressDiscoveryStarted = createAction<LoadingEnabled>('addresses/addressDiscoveryStarted')

export const addressDiscoveryFinished = createAction<LoadingEnabled>('addresses/addressDiscoveryFinished')

export const contactsLoadedFromPersistentStorage = createAction<Contact[]>(
  'contacts/contactsLoadedFromPersistentStorage'
)

export const contactStorageFailed = createAction<Message>('contacts/contactStorageFailed')

export const contactDeletionFailed = createAction<Message>('contacts/contactDeletionFailed')

type LoadingEnabled = boolean | undefined
