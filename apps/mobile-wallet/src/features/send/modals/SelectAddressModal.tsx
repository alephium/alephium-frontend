import { AddressHash } from '@alephium/shared'
import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addressesSlice'

interface SelectAddressModalProps {
  onAddressPress: (addressHash: AddressHash) => void
  hideEmptyAddresses?: boolean
}

const SelectAddressModal = withModal<SelectAddressModalProps>(({ id, onAddressPress, hideEmptyAddresses }) => {
  const addresses = useAppSelector(selectAllAddresses)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(closeModal({ id }))
    onAddressPress(addressHash)
  }

  const data = hideEmptyAddresses ? addresses.filter((a) => a.tokens.length !== 0 && a.balance !== '0') : addresses

  return (
    <BottomModalFlashList
      modalId={id}
      title={t('Addresses')}
      flashListRender={(props) => (
        <FlashList
          data={data}
          keyExtractor={(item) => item.hash}
          estimatedItemSize={70}
          renderItem={({ item: address, index }) => (
            <AddressBox
              key={address.hash}
              addressHash={address.hash}
              onPress={() => handleAddressPress(address.hash)}
              isLast={index === data.length - 1}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default SelectAddressModal
