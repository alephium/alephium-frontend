/*
Copyright 2018 - 2022 The Alephium Authors
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

import { FlatList } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AddressBox from '~/components/AddressBox'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

export interface AddressFlatListProps extends ScrollScreenProps {
  onAddressPress: (addressHash: AddressHash) => void
}

const AddressFlatList = ({ onAddressPress, ...props }: AddressFlatListProps) => {
  const addresses = useAppSelector(selectAllAddresses)
  const insets = useSafeAreaInsets()

  return (
    <FlatList
      data={addresses}
      style={{ marginBottom: insets.bottom + insets.top }}
      keyExtractor={(item) => item.hash}
      contentContainerStyle={{ gap: VERTICAL_GAP }}
      renderItem={({ item: address, index }) => (
        <AddressBox
          key={address.hash}
          addressHash={address.hash}
          style={{
            marginTop: index === 0 ? 20 : undefined,
            marginBottom: index === addresses.length - 1 ? 40 : undefined
          }}
          onPress={() => onAddressPress(address.hash)}
        />
      )}
      {...props}
    />
  )
}

export default AddressFlatList
