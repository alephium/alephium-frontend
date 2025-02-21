import { motion } from 'framer-motion'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import ContactCard from '@/features/contacts/ContactCard'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import AddressesPageTabContent from '@/pages/unlockedWallet/addressesPage/AddressesPageTabContent'
import { selectAllContacts } from '@/storage/addresses/addressesSelectors'
import { filterContacts } from '@/utils/contacts'

const ContactsTabContent = memo(() => {
  const { t } = useTranslation()
  const contacts = useAppSelector(selectAllContacts)
  const dispatch = useAppDispatch()

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchInput, setSearchInput] = useState('')

  const newContactButtonText = `+ ${t('New contact')}`

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))
  }, [contacts, searchInput])

  const openNewContactFormModal = () => dispatch(openModal({ name: 'ContactFormModal', props: {} }))

  return (
    <AddressesPageTabContent
      searchPlaceholder={t('Search for name or a hash...')}
      onSearch={setSearchInput}
      buttonText={newContactButtonText}
      onButtonClick={openNewContactFormModal}
    >
      <ContactBox>
        {filteredContacts.map((contact) => (
          <ContactCard contactId={contact.id} key={contact.id} />
        ))}
        {contacts.length === 0 && (
          <PlaceholderCard layout isPlaceholder>
            <Text>{t('Create contacts to avoid mistakes when sending transactions!')}</Text>
            <motion.div>
              <Button role="secondary" short onClick={openNewContactFormModal}>
                {newContactButtonText}
              </Button>
            </motion.div>
          </PlaceholderCard>
        )}
      </ContactBox>
    </AddressesPageTabContent>
  )
})

export default ContactsTabContent

const PlaceholderCard = styled(Card)`
  padding: 70px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Text = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  text-align: center;
  line-height: 1.3;
  margin-bottom: 20px;
`

const ContactBox = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-4);
`
