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

import { useMemo } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesAssets, selectAllAddresses } from '~/store/addressesSlice'
import { Address } from '~/types/addresses'

import { ScreenSection } from './layout/Screen'
import TokenInfo from './TokenInfo'

interface AddressesTokensListProps {
  addresses?: Address[]
  style?: StyleProp<ViewStyle>
}

const AddressesTokensList = ({ addresses: addressesParam, style }: AddressesTokensListProps) => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const addresses = addressesParam ?? allAddresses
  const selectAddressesAssets = useMemo(makeSelectAddressesAssets, [])
  const assets = useAppSelector((s) =>
    selectAddressesAssets(
      s,
      addresses.map(({ hash }) => hash)
    )
  )

  return (
    <View style={style}>
      <ScreenSection>
        {assets.map((asset, index) => (
          <TokenInfo asset={asset} key={asset.id} isLast={index === assets.length - 1} />
        ))}
      </ScreenSection>
    </View>
  )
}

export default AddressesTokensList
