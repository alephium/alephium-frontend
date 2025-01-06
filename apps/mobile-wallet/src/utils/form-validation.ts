import { Contact } from '@alephium/shared'
import { isValidAddress, Optional } from '@alephium/web3'

import i18n from '~/features/localization/i18n'
import { store } from '~/store/store'

// Same as in desktop wallet
export const requiredErrorMessage = 'This field is required'

// Same as in desktop wallet
export const isAddressValid = (value: string) => isValidAddress(value) || i18n.t('This address is not valid')

// Same as in desktop wallet
export const isContactAddressValid = ({ address, id }: Optional<Omit<Contact, 'name'>, 'id'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.address === address)

  return existingContact && existingContact.id !== id
    ? `${i18n.t('A contact with this address already exists')}: ${existingContact.name}`
    : true
}

// Same as in desktop wallet
export const isContactNameValid = ({ name, id }: Optional<Omit<Contact, 'address'>, 'id'>) => {
  const state = store.getState()
  const contacts = Object.values(state.contacts.entities) as Contact[]
  const existingContact = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase())

  return existingContact && existingContact.id !== id
    ? `${i18n.t('A contact with this name already exists')}: ${existingContact.address}`
    : true
}
