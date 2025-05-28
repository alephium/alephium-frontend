import { Contact } from '@alephium/shared'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { memo } from 'react'

import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

interface SelectContactModalProps {
  onContactPress: (contactId: Contact['id']) => void
}

const SelectContactModal = memo<SelectContactModalProps & ModalBaseProp>(({ id, onContactPress }) => {
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
