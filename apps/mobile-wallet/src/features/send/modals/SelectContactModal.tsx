import { Contact } from '@alephium/shared'

import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

interface SelectContactModalProps {
  onContactPress: (contactId: Contact['id']) => void
  onNewContactPress?: () => void
}

const SelectContactModal = withModal<SelectContactModalProps>(({ id, onContactPress, onNewContactPress }) => {
  const dispatch = useAppDispatch()

  const handleContactPress = (contactId: string) => {
    onContactPress(contactId)
    dispatch(closeModal({ id }))
  }

  const handleNewContactPress = () => {
    onNewContactPress && onNewContactPress()
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id}>
      <ModalContent>
        <ContactListScreenBase onContactPress={handleContactPress} onNewContactPress={handleNewContactPress} />
      </ModalContent>
    </BottomModal>
  )
})

export default SelectContactModal
