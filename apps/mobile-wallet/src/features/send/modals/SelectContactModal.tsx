import { Contact } from '@alephium/shared'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'

import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

interface SelectContactModalProps {
  onContactPress: (contactId: Contact['id']) => void
}

const SelectContactModal = withModal<SelectContactModalProps>(({ id, onContactPress }) => {
  const { dismiss } = useBottomSheetModal()

  const handleContactPress = (contactId: string) => {
    onContactPress(contactId)
    dismiss(id)
  }

  const handleNewContactPress = () => {
    dismiss(id)
  }

  return (
    <BottomModal2 modalId={id}>
      <ContactListScreenBase isInModal onContactPress={handleContactPress} onNewContactPress={handleNewContactPress} />
    </BottomModal2>
  )
})

export default SelectContactModal
