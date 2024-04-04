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

import { Contact, ContactFormData } from '@alephium/shared'
import { nanoid } from 'nanoid'

import i18n from '@/i18n'
import { PersistentArrayStorage } from '@/storage/persistentArrayStorage'
import { StoredEncryptedWallet } from '@/types/wallet'

class ContactsStorage extends PersistentArrayStorage<Contact> {
  storeOne(walletId: StoredEncryptedWallet['id'], contact: ContactFormData) {
    let contactId = contact.id
    const contacts: Contact[] = this.load(walletId)

    const indexOfContactWithSameAddress = contacts.findIndex((c: Contact) => c.address === contact.address)
    const indexOfContactWithSameName = contacts.findIndex(
      (c: Contact) => c.name.toLowerCase() === contact.name.toLowerCase()
    )

    if (contactId === undefined) {
      if (indexOfContactWithSameAddress >= 0) throw new Error(i18n.t('A contact with this address already exists'))
      if (indexOfContactWithSameName >= 0) throw new Error(i18n.t('A contact with this name already exists'))

      contactId = nanoid()

      contacts.push({ ...contact, id: contactId })
    } else {
      const indexOfContactWithSameId = contacts.findIndex((c: Contact) => c.id === contact.id)

      if (indexOfContactWithSameId < 0) throw new Error(i18n.t('Could not find a contact with this ID'))
      if (indexOfContactWithSameAddress >= 0 && indexOfContactWithSameAddress !== indexOfContactWithSameId)
        throw new Error(i18n.t('A contact with this address already exists'))
      if (indexOfContactWithSameName >= 0 && indexOfContactWithSameName !== indexOfContactWithSameId)
        throw new Error(i18n.t('A contact with this name already exists'))

      contacts.splice(indexOfContactWithSameId, 1, contact as Contact)
    }

    console.log(`🟠 Storing contact ${contact.name} locally`)
    super.store(walletId, contacts)

    return contactId
  }

  deleteContact(walletId: StoredEncryptedWallet['id'], contact: Contact) {
    const contacts: Contact[] = this.load(walletId)
    const storedContactIndex = contacts.findIndex((c) => c.id === contact.id)

    if (storedContactIndex < 0) throw new Error(i18n.t('Could not find a contact with this ID'))

    contacts.splice(storedContactIndex, 1)

    console.log(`🟠 Deleting contact ${contact.name}`)
    super.store(walletId, contacts)
  }
}

export const contactsStorage = new ContactsStorage('contacts')
