import { AddressHash } from '@alephium/shared'

import AddressBox from '~/components/AddressBox'
import FlashListScreen, { FlashListScreenProps } from '~/components/layout/FlashListScreen'
import { useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { Address } from '~/types/addresses'

export interface AddressFlashListScreenProps extends Partial<FlashListScreenProps<Address>> {
  onAddressPress: (addressHash: AddressHash) => void
  selectedAddress?: AddressHash
  contentPaddingTop?: boolean | number
  hideEmptyAddresses?: boolean
}

const AddressFlashListScreen = ({
  onAddressPress,
  selectedAddress,
  hideEmptyAddresses,
  ...props
}: AddressFlashListScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)

  const data = hideEmptyAddresses ? addresses.filter((a) => a.tokens.length !== 0 && a.balance !== '0') : addresses

  return (
    <FlashListScreen
      data={data}
      keyExtractor={(item) => item.hash}
      estimatedItemSize={70}
      extraData={{ selectedAddress }}
      renderItem={({ item: address, index, extraData }) => (
        <AddressBox
          key={address.hash}
          addressHash={address.hash}
          isSelected={address.hash === extraData.selectedAddress}
          isLast={index === data.length - 1}
          style={{
            marginLeft: DEFAULT_MARGIN,
            marginRight: DEFAULT_MARGIN
          }}
          onPress={() => onAddressPress(address.hash)}
        />
      )}
      shouldUseGaps
      {...props}
    />
  )
}

export default AddressFlashListScreen
