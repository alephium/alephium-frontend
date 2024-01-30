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

import { isAddressValid as isAddressHashValid } from '@alephium/shared'
import { Optional } from '@alephium/web3'

import { store } from '~/store/store'
import { Contact } from '~/types/contacts'

// TODO: Same as in desktop wallet
export const requiredErrorMessage = 'This field is required'

// TODO: Same as in desktop wallet
export const isAddressValid = (value: string) => isAddressHashValid(value) || 'This address is not valid'

// TODO: Same as in desktop wallet
export const isContactAddressValid = ({ address, id }: Optional<Omit<Contact, 'name'>, 'id'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.address === address)

  return existingContact && existingContact.id !== id
    ? `A contact with this address already exists: ${existingContact.name}`
    : true
}

// TODO: Same as in desktop wallet
export const isContactNameValid = ({ name, id }: Optional<Omit<Contact, 'address'>, 'id'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase())

  return existingContact && existingContact.id !== id
    ? `A contact with this name already exists: ${existingContact.address}`
    : true
}
