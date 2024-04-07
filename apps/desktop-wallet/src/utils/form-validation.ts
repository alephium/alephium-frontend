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

import { Contact, isAddressValid as isAddressHashValid } from '@alephium/shared'
import { Optional } from '@alephium/web3'

import i18n from '@/i18n'
import { store } from '@/storage/store'

export const requiredErrorMessage = i18n.t('This field is required')

export const isAddressValid = (value: string) => isAddressHashValid(value) || i18n.t('This address is not valid')

export const isContactAddressValid = ({ address, id }: Optional<Omit<Contact, 'name'>, 'id'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.address === address)

  return existingContact && existingContact.id !== id
    ? i18n.t('A contact with this address already exists') + `: ${existingContact.name}`
    : true
}

export const isContactNameValid = ({ name, id }: Optional<Omit<Contact, 'address'>, 'id'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase())

  return existingContact && existingContact.id !== id
    ? i18n.t('A contact with this name already exists') + `: ${existingContact.address}`
    : true
}

export const isWalletNameValid = ({ name, previousName }: { name: string; previousName?: string }) =>
  previousName && name === previousName
    ? true
    : name.length < 3
      ? i18n.t('Wallet name is too short')
      : store.getState().global.wallets.some((wallet) => wallet.name === name)
        ? i18n.t('Wallet name already taken')
        : true
