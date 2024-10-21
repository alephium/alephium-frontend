/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
