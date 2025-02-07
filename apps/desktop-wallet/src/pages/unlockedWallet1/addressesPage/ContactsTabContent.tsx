import { Contact } from '@alephium/shared'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { ArrowUp, Pencil } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Card from '@/components/Card'
import HashEllipsed from '@/components/HashEllipsed'
import Truncate from '@/components/Truncate'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import TabContent from '@/pages/unlockedWallet1/addressesPage/TabContent'
import { selectAllContacts, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { stringToColour } from '@/utils/colors'
import { filterContacts } from '@/utils/contacts'
import { getInitials } from '@/utils/misc'

const ContactsTabContent = memo(() => {
  const { t } = useTranslation()
  const contacts = useAppSelector(selectAllContacts)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const dispatch = useAppDispatch()

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchInput, setSearchInput] = useState('')

  const newContactButtonText = `+ ${t('New contact')}`

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchInput.toLowerCase()))
  }, [contacts, searchInput])

  const openSendModal = (contact: Contact) => {
    dispatch(
      openModal({
        name: 'TransferSendModal',
        props: { initialTxData: { fromAddress: defaultAddress, toAddress: contact.address } }
      })
    )
  }

  const openEditContactModal = (contact: Contact) =>
    dispatch(openModal({ name: 'ContactFormModal', props: { contact } }))

  const openNewContactFormModal = () => dispatch(openModal({ name: 'ContactFormModal', props: {} }))

  return (
    <TabContent
      searchPlaceholder={t('Search for name or a hash...')}
      onSearch={setSearchInput}
      buttonText={newContactButtonText}
      onButtonClick={openNewContactFormModal}
    >
      <ContactBox>
        {filteredContacts.map((contact) => (
          <Card key={contact.address}>
            <ContentRow>
              <Initials color={stringToColour(contact.address)}>{getInitials(contact.name)}</Initials>
              <Name>{contact.name}</Name>
              <HashEllipsedStyled hash={contact.address} />
            </ContentRow>
            <ButtonsRow>
              <SendButton transparent onClick={() => openSendModal(contact)}>
                <ArrowUp strokeWidth={1} />
                <ButtonText>{t('Send')}</ButtonText>
              </SendButton>
              <Separator />
              <EditButton transparent onClick={() => openEditContactModal(contact)}>
                <Pencil strokeWidth={1} />
                <ButtonText>{t('Edit')}</ButtonText>
              </EditButton>
            </ButtonsRow>
          </Card>
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
    </TabContent>
  )
})

export default ContactsTabContent

const ContentRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4);
  gap: 20px;
  text-align: center;
`

const Initials = styled.div<{ color: string }>`
  display: flex;
  height: 80px;
  width: 80px;
  font-size: 16px;
  background-color: ${({ color }) => colord(color).alpha(0.08).toHex()};
  border: 1px solid ${({ color }) => colord(color).alpha(0.2).toHex()};
  color: ${({ color }) => colord(color).alpha(0.8).toHex()};
  border-radius: var(--radius-full);
  align-items: center;
  justify-content: center;
`

const Name = styled(Truncate)`
  font-size: 18px;
  font-weight: var(--fontWeight-semiBold);
  max-width: 100%;
`

const ButtonsRow = styled.div`
  display: flex;
`

const HashEllipsedStyled = styled(HashEllipsed)`
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
  width: 65%;
  color: ${({ theme }) => theme.font.tertiary};
`

const BottomButton = styled(Button)`
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 0;
  height: 85px;
  margin: 0;
  flex-direction: column;
`

const SendButton = styled(BottomButton)``
const EditButton = styled(BottomButton)``

const ButtonText = styled.div`
  font-size: 12px;
  margin-top: 10px;
`

const Separator = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`

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
