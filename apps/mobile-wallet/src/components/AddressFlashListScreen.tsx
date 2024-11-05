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
}

const AddressFlashListScreen = ({ onAddressPress, selectedAddress, ...props }: AddressFlashListScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)

  return (
    <FlashListScreen
      data={addresses}
      keyExtractor={(item) => item.hash}
      estimatedItemSize={70}
      renderItem={({ item: address, index }) => (
        <AddressBox
          key={address.hash}
          addressHash={address.hash}
          isSelected={address.hash === selectedAddress}
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
