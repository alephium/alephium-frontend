import { Contact } from '@alephium/shared'
import { isValidAddress, Optional } from '@alephium/web3'

import i18n from '@/features/localization/i18n'
import { store } from '@/storage/store'

export const requiredErrorMessage = i18n.t('This field is required')

export const isAddressValid = (value: string) => isValidAddress(value) || i18n.t('This address is not valid')

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
