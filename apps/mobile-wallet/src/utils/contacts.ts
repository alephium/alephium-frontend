import { Contact } from '@alephium/shared'

// Same as in desktop wallet
export const filterContacts = (contacts: Contact[], text: string) =>
  text.length < 2
    ? contacts
    : contacts.filter(
        (contact) => contact.name.toLowerCase().includes(text) || contact.address.toLowerCase().includes(text)
      )
