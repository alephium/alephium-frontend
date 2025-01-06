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
