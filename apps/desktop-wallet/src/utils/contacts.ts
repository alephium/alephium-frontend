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

import { Contact } from '@alephium/shared'

import { contactsLoadedFromPersistentStorage } from '@/storage/addresses/addressesActions'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import { store } from '@/storage/store'
import { StoredEncryptedWallet } from '@/types/wallet'

export const filterContacts = (contacts: Contact[], text: string) =>
  text.length < 2
    ? contacts
    : contacts.filter(
        (contact) => contact.name.toLowerCase().includes(text) || contact.address.toLowerCase().includes(text)
      )

export const loadContacts = (walletId: StoredEncryptedWallet['id']) => {
  const contacts: Contact[] = contactsStorage.load(walletId)

  if (contacts.length > 0) store.dispatch(contactsLoadedFromPersistentStorage(contacts))
}
