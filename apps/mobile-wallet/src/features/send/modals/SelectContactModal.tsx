import { Contact } from '@alephium/shared'
import { memo } from 'react'

import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

interface SelectContactModalProps {
  onContactPress: (contactId: Contact['id']) => void
}

const SelectContactModal = memo<SelectContactModalProps>(({ onContactPress }) => {
  const { dismissModal } = useModalContext()

  const handleContactPress = (contactId: string) => {
    onContactPress(contactId)
    dismissModal()
  }

  const handleNewContactPress = () => {
    dismissModal()
  }

  return (
    <BottomModal>
      <ContactListScreenBase isInModal onContactPress={handleContactPress} onNewContactPress={handleNewContactPress} />
    </BottomModal>
  )
})

export default SelectContactModal
