import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'
import styled from 'styled-components/native'

import AddressBox, { AddressBoxProps } from '~/components/AddressBox'
import FlashListScreen, { FlashListScreenProps } from '~/components/layout/FlashListScreen'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface AddressFlashListScreenProps extends Partial<FlashListScreenProps<AddressHash>> {
  onAddressPress: (addressHash: AddressHash) => void
  origin: AddressBoxProps['origin']
  selectedAddress?: AddressHash
  contentPaddingTop?: boolean | number
  tokenId?: Token['id']
}

const AddressFlashListScreen = ({
  onAddressPress,
  selectedAddress,
  tokenId,
  origin,
  data,
  ...props
}: AddressFlashListScreenProps) => (
  <FlashListScreen
    data={data}
    extraData={{ selectedAddress }}
    renderItem={({ item: addressHash, index, extraData }) => (
      <AddressBoxStyled
        key={addressHash}
        addressHash={addressHash}
        isSelected={addressHash === extraData.selectedAddress}
        isLast={index === (data?.length ?? 0) - 1}
        onPress={() => onAddressPress(addressHash)}
        tokenId={tokenId}
        origin={origin}
        showGroup
      />
    )}
    shouldUseGaps
    {...props}
  />
)

export default AddressFlashListScreen

const AddressBoxStyled = styled(AddressBox)`
  margin-left: ${DEFAULT_MARGIN}px;
  margin-right: ${DEFAULT_MARGIN}px;
`
