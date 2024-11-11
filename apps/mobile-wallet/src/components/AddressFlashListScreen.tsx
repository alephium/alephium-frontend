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
import FlashListScreen, { FlashListScreenProps } from '~/components/layout/FlashListScreen'
import { useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addressesSlice'
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
            margin: index === 0 ? 20 : 0,
            marginBottom: 20,
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
