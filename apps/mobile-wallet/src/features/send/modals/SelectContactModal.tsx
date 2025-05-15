import { Contact } from '@alephium/shared'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'

import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

interface SelectContactModalProps {
  onContactPress: (contactId: Contact['id']) => void
}

const SelectContactModal = withModal<SelectContactModalProps>(({ id, onContactPress }) => {
  const { dismiss } = useBottomSheetModal()

  const handleContactPress = (contactId: string) => {
    onContactPress(contactId)
    dismiss()
  }

  const handleNewContactPress = () => {
    dismiss()
  }

  return (
    <BottomModal2 modalId={id}>
      <ModalContent>
        <ContactListScreenBase
          isInModal
          onContactPress={handleContactPress}
          onNewContactPress={handleNewContactPress}
        />
      </ModalContent>
    </BottomModal2>
  )
})

export default SelectContactModal
