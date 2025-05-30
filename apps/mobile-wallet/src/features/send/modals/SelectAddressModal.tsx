import { AddressHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'

interface SelectAddressModalProps {
  onAddressPress: (addressHash: AddressHash) => void
}

const SelectAddressModal = memo<SelectAddressModalProps & ModalBaseProp>(({ id, onAddressPress }) => {
  const { data } = useFetchAddressesHashesSortedByLastUse()
  const { dismiss } = useBottomSheetModal()
  const { t } = useTranslation()

  const handleAddressPress = (addressHash: AddressHash) => {
    dismiss(id)
    onAddressPress(addressHash)
  }

  return (
    <BottomModal2
      modalId={id}
      title={t('Addresses')}
      flashListProps={{
        data,
        estimatedItemSize: 70,
        renderItem: ({ item: addressHash, index }) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            onPress={() => handleAddressPress(addressHash)}
            isLast={index === data.length - 1}
            origin="selectAddressModal"
            showGroup
          />
        )
      }}
    />
  )
})

export default SelectAddressModal
