import { AddressHash } from '@alephium/shared/types'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'

interface SelectAddressModalProps {
  onAddressPress: (addressHash: AddressHash) => void
  addressHashes?: AddressHash[]
}

const SelectAddressModal = memo<SelectAddressModalProps>(({ onAddressPress, addressHashes }) => {
  const { data: sortedAddressHashes } = useFetchAddressesHashesSortedByLastUse()
  const { dismissModal } = useModalContext()
  const { t } = useTranslation()

  const data = addressHashes ? sortedAddressHashes.filter((hash) => addressHashes.includes(hash)) : sortedAddressHashes

  const handleAddressPress = (addressHash: AddressHash) => {
    dismissModal()
    onAddressPress(addressHash)
  }

  return (
    <BottomModal
      title={t('Addresses')}
      flashListProps={{
        data,
        renderItem: ({ item: addressHash, index }) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            onPress={() => handleAddressPress(addressHash)}
            isLast={index === data.length - 1}
            origin="select_address_modal"
            showGroup
          />
        )
      }}
    />
  )
})

export default SelectAddressModal
