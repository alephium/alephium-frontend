import { AddressHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'

interface SelectAddressModalProps {
  onAddressPress: (addressHash: AddressHash) => void
}

const SelectAddressModal = memo<SelectAddressModalProps>(({ onAddressPress }) => {
  const { data } = useFetchAddressesHashesSortedByLastUse()
  const { dismissModal } = useModalContext()
  const { t } = useTranslation()

  const handleAddressPress = (addressHash: AddressHash) => {
    dismissModal()
    onAddressPress(addressHash)
  }

  return (
    <BottomModal2
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
