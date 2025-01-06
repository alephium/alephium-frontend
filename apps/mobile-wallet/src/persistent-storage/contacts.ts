import {
  Contact,
  contactDeletedFromPersistentStorage,
  ContactFormData,
  contactStoredInPersistentStorage
} from '@alephium/shared'
import { nanoid } from 'nanoid'

import i18n from '~/features/localization/i18n'
import { getStoredWalletMetadata, updateStoredWalletMetadata } from '~/persistent-storage/wallet'
import { store } from '~/store/store'

export const persistContact = async (contactData: ContactFormData) => {
  const { contacts } = await getStoredWalletMetadata(
    `${i18n.t('Could not persist contact')}: ${i18n.t('Wallet metadata not found')}`
  )

  let contactId = contactData.id

  const indexOfContactWithSameAddress = contacts.findIndex((c: Contact) => c.address === contactData.address)
  const indexOfContactWithSameName = contacts.findIndex(
    (c: Contact) => c.name.toLowerCase() === contactData.name.toLowerCase()
  )

  if (contactId === undefined) {
    if (indexOfContactWithSameAddress >= 0) throw new Error(i18n.t('A contact with this address already exists'))

    if (indexOfContactWithSameName >= 0) throw new Error(i18n.t('A contact with this name already exists'))

    contactId = nanoid()
    contacts.push({ ...contactData, id: contactId })
  } else {
    const indexOfContactWithSameId = contacts.findIndex((c: Contact) => c.id === contactData.id)

    if (indexOfContactWithSameId < 0) throw new Error(i18n.t('Could not find a contact with this ID'))

    if (indexOfContactWithSameAddress >= 0 && indexOfContactWithSameAddress !== indexOfContactWithSameId)
      throw new Error(i18n.t('A contact with this address already exists'))

    if (indexOfContactWithSameName >= 0 && indexOfContactWithSameName !== indexOfContactWithSameId)
      throw new Error(i18n.t('A contact with this name already exists'))

    contacts.splice(indexOfContactWithSameId, 1, contactData as Contact)
  }

  console.log('💽 Storing contact in persistent storage')

  await updateStoredWalletMetadata({ contacts })

  store.dispatch(contactStoredInPersistentStorage({ ...contactData, id: contactId }))

  return contactId
}

export const deleteContact = async (contactId: Contact['id']) => {
  const { contacts } = await getStoredWalletMetadata(
    `${i18n.t('Could not delete contact')}: ${i18n.t('Wallet metadata not found')}`
  )

  const storedContactIndex = contacts.findIndex((c) => c.id === contactId)

  if (storedContactIndex < 0) throw new Error(i18n.t('Could not find a contact with this ID'))

  contacts.splice(storedContactIndex, 1)

  await updateStoredWalletMetadata({ contacts })

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
