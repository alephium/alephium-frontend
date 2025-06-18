import { Contact } from '@alephium/shared'
import { memo } from 'react'

import BottomModal2 from '~/features/modals/BottomModal2'
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
    <BottomModal2>
      <ContactListScreenBase isInModal onContactPress={handleContactPress} onNewContactPress={handleNewContactPress} />
    </BottomModal2>
  )
})

export default SelectContactModal
