import { Contact } from '@alephium/shared'
import { memo } from 'react'

import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

interface SelectContactModalProps {
  onContactPress: (contactId: Contact['id']) => void
}

const SelectContactModal = memo<SelectContactModalProps & ModalBaseProp>(({ id, onContactPress }) => {
  const { dismissModal, onDismiss } = useModalDismiss({ id })

  const handleContactPress = (contactId: string) => {
    onContactPress(contactId)
    dismissModal()
  }

  const handleNewContactPress = () => {
    dismissModal()
  }

  return (
    <BottomModal2 onDismiss={onDismiss} modalId={id}>
      <ContactListScreenBase isInModal onContactPress={handleContactPress} onNewContactPress={handleNewContactPress} />
    </BottomModal2>
  )
})

export default SelectContactModal
