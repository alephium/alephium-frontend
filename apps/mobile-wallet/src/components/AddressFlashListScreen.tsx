import { AddressHash, DEPRECATED_Address as Address } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'

import AddressBox, { AddressBoxProps } from '~/components/AddressBox'
import FlashListScreen, { FlashListScreenProps } from '~/components/layout/FlashListScreen'
import { useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface AddressFlashListScreenProps extends Partial<FlashListScreenProps<Address>> {
  onAddressPress: (addressHash: AddressHash) => void
  origin: AddressBoxProps['origin']
  selectedAddress?: AddressHash
  contentPaddingTop?: boolean | number
  hideEmptyAddresses?: boolean
  tokenId?: Token['id']
}

const AddressFlashListScreen = ({
  onAddressPress,
  selectedAddress,
  hideEmptyAddresses,
  tokenId,
  origin,
  ...props
}: AddressFlashListScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)

  const filteredAddresses =
    tokenId && tokenId !== ALPH.id ? addresses.filter((a) => a.tokens.some((t) => t.tokenId === tokenId)) : addresses
  const data = hideEmptyAddresses ? filteredAddresses.filter((a) => a.balance !== '0') : filteredAddresses

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
          tokenId={tokenId}
          origin={origin}
          showGroup
        />
      )}
      shouldUseGaps
      {...props}
    />
  )
}

export default AddressFlashListScreen
