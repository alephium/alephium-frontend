/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash, AddressSettings, Contact } from '@alephium/shared'
import { createAction } from '@reduxjs/toolkit'

import { Address, AddressBase, LoadingEnabled } from '@/types/addresses'
import { Message } from '@/types/snackbar'

export const addressesRestoredFromMetadata = createAction<AddressBase[]>('addresses/addressesRestoredFromMetadata')

export const addressRestorationStarted = createAction('addresses/addressRestorationStarted')

export const newAddressesSaved = createAction<AddressBase[]>('addresses/newAddressesSaved')

export const addressDeleted = createAction<AddressHash>('addresses/addressDeleted')

export const defaultAddressChanged = createAction<Address>('addresses/defaultAddressChanged')

export const addressDiscoveryStarted = createAction<LoadingEnabled>('addresses/addressDiscoveryStarted')

export const addressDiscoveryFinished = createAction<LoadingEnabled>('addresses/addressDiscoveryFinished')

export const addressSettingsSaved = createAction<{ addressHash: AddressHash; settings: AddressSettings }>(
  'addresses/addressSettingsSaved'
)

export const contactsLoadedFromPersistentStorage = createAction<Contact[]>(
  'contacts/contactsLoadedFromPersistentStorage'
)

export const contactStorageFailed = createAction<Message>('contacts/contactStorageFailed')

export const contactDeletionFailed = createAction<Message>('contacts/contactDeletionFailed')
