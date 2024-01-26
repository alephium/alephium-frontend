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

import { nanoid } from 'nanoid'

import { getWalletMetadata, persistWalletMetadata } from '~/persistent-storage/wallet'
import {
  contactDeletedFromPersistentStorage,
  contactStoredInPersistentStorage
} from '~/store/addresses/addressesActions'
import { store } from '~/store/store'
import { Contact, ContactFormData } from '~/types/contacts'

export const persistContact = async (contactData: ContactFormData) => {
  const metadata = await getWalletMetadata()

  const contacts = metadata?.contacts ?? []
  let contactId = contactData.id

  const indexOfContactWithSameAddress = contacts.findIndex((c: Contact) => c.address === contactData.address)
  const indexOfContactWithSameName = contacts.findIndex(
    (c: Contact) => c.name.toLowerCase() === contactData.name.toLowerCase()
  )

  if (contactId === undefined) {
    if (indexOfContactWithSameAddress >= 0) throw new Error('A contact with this address already exists')

    if (indexOfContactWithSameName >= 0) throw new Error('A contact with this name already exists')

    contactId = nanoid()
    contacts.push({ ...contactData, id: contactId })
  } else {
    const indexOfContactWithSameId = contacts.findIndex((c: Contact) => c.id === contactData.id)

    if (indexOfContactWithSameId < 0) throw new Error('Could not find a contact with this ID')

    if (indexOfContactWithSameAddress >= 0 && indexOfContactWithSameAddress !== indexOfContactWithSameId)
      throw new Error('A contact with this address already exists')

    if (indexOfContactWithSameName >= 0 && indexOfContactWithSameName !== indexOfContactWithSameId)
      throw new Error('A contact with this name already exists')

    contacts.splice(indexOfContactWithSameId, 1, contactData as Contact)
  }

  console.log('💽 Storing contact in persistent storage')

  await persistWalletMetadata({ contacts })

  store.dispatch(contactStoredInPersistentStorage({ ...contactData, id: contactId }))

  return contactId
}

export const deleteContact = async (contactId: Contact['id']) => {
  const metadata = await getWalletMetadata()

  const contacts = metadata?.contacts ?? []
  const storedContactIndex = contacts.findIndex((c) => c.id === contactId)

  if (storedContactIndex < 0) throw new Error('Could not find a contact with this ID')

  contacts.splice(storedContactIndex, 1)

  await persistWalletMetadata({ contacts })

  store.dispatch(contactDeletedFromPersistentStorage(contactId))
}

export const importContacts = async (contacts: ContactFormData[]) => {
  for (const contact of contacts) {
    try {
      await persistContact(contact)
    } catch (e) {
      console.warn(e)
    }
  }
}
