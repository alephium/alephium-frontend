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

import { AddressHash } from '@alephium/shared'

import AddressBox from '~/components/AddressBox'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalFlatListContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addressesSlice'

interface SelectAddressModalProps {
  onAddressPress: (addressHash: AddressHash) => void
}

const SelectAddressModal = withModal<SelectAddressModalProps>(({ id, onAddressPress }) => {
  const addresses = useAppSelector(selectAllAddresses)
  const dispatch = useAppDispatch()

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(closeModal({ id }))
    onAddressPress(addressHash)
  }

  return (
    <BottomModal id={id}>
      <ModalFlatListContent
        data={addresses}
        verticalGap
        keyExtractor={(item) => item.hash}
        renderItem={({ item: address, index }) => (
          <AddressBox
            key={address.hash}
            addressHash={address.hash}
            style={{
              marginTop: index === 0 ? 20 : undefined,
              marginBottom: index === addresses.length - 1 ? 40 : undefined
            }}
            onPress={() => handleAddressPress(address.hash)}
          />
        )}
      />
    </BottomModal>
  )
})

export default SelectAddressModal
