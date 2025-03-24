import { AddressHash, Contact, selectDefaultAddressHash } from '@alephium/shared'
import { colord } from 'colord'
import { Pencil, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import Card from '@/components/Card'
import HashEllipsed from '@/components/HashEllipsed'
import Truncate from '@/components/Truncate'
import { openModal } from '@/features/modals/modalActions'
import useSendButton from '@/features/send/useSendButton'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectContactByHash } from '@/storage/addresses/addressesSelectors'
import { useHashToColor } from '@/utils/colors'
import { getInitials } from '@/utils/misc'

interface ContactCardProps {
  contactId: string
}

const ContactCard = ({ contactId }: ContactCardProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const { t } = useTranslation()
  const contact = useAppSelector((s) => selectContactByHash(s, contactId))
  const contactColor = useHashToColor(contactId) || theme.global.complementary
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  if (!contact || !defaultAddressHash) return null

  const openEditContactModal = (contact: Contact) =>
    dispatch(openModal({ name: 'ContactFormModal', props: { contact } }))

  return (
    <Card>
      <ContentRow>
        <Initials color={contactColor}>{getInitials(contact.name)}</Initials>
        <Name>{contact.name}</Name>
        <HashEllipsedStyled hash={contact.address} width={120} />
      </ContentRow>
      <ButtonsRow>
        <ContactSendButton contactAddressHash={contact.address} fromAddressHash={defaultAddressHash} />
        <Separator />
        <BottomButton transparent onClick={() => openEditContactModal(contact)}>
          <Pencil strokeWidth={1.5} />
          <ButtonText>{t('Edit')}</ButtonText>
        </BottomButton>
      </ButtonsRow>
    </Card>
  )
}

export default ContactCard

interface ContactSendButtonProps {
  contactAddressHash: Contact['address']
  fromAddressHash: AddressHash
}

const ContactSendButton = ({ contactAddressHash, fromAddressHash }: ContactSendButtonProps) => {
  const { t } = useTranslation()
  const { tooltipContent, handleClick, cursor } = useSendButton({
    fromAddressHash,
    toAddressHash: contactAddressHash,
    analyticsOrigin: 'contact'
  })

  return (
    <BottomButton
      data-tooltip-id="default"
      data-tooltip-content={tooltipContent}
      transparent
      onClick={handleClick}
      style={{ cursor }}
    >
      <Send size={20} strokeWidth={1.5} />
      <ButtonText>{t('Send')}</ButtonText>
    </BottomButton>
  )
}

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
  color: ${({ theme }) => theme.font.tertiary};
`

const BottomButton = styled(Button)`
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 0;
  height: 85px;
  margin: 0;
  flex-direction: column;
`

const ButtonText = styled.div`
  font-size: 12px;
`

const Separator = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
