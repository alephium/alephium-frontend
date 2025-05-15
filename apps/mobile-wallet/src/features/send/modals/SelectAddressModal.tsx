import { AddressHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import BottomModal2 from '~/features/modals/BottomModal2'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'

interface SelectAddressModalProps {
  onAddressPress: (addressHash: AddressHash) => void
}

const SelectAddressModal = withModal<SelectAddressModalProps>(({ id, onAddressPress }) => {
  const { data } = useFetchAddressesHashesSortedByLastUse()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(closeModal({ id }))
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
