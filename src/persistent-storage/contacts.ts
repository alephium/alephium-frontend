/*
Copyright 2018 - 2022 The Alephium Authors
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

import AsyncStorage from '@react-native-async-storage/async-storage'
import { nanoid } from '@reduxjs/toolkit'

import { Contact, ContactFormData } from '~/types/contacts'

export const loadContacts = async (): Promise<Contact[]> => {
  try {
    const rawSettings = await AsyncStorage.getItem('contacts')
    if (!rawSettings) return [] as Contact[]

    return JSON.parse(rawSettings) as Contact[]
  } catch (e) {
    console.error(e)
    return [] as Contact[]
  }
}

export const persistContact = async (contactData: ContactFormData): Promise<Contact['id']> => {
  const contacts = await loadContacts()

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

  await AsyncStorage.setItem('contacts', JSON.stringify(contacts))

  return contactId
}
