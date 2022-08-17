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

import { Star as StarIcon } from 'lucide-react-native'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { Address } from '../store/addressesSlice'
import { AddressSettings } from '../types/addresses'
import { isAddress, isAddressSettings } from '../utils/addresses'

interface AddressBadgeProps {
  address: Address | AddressSettings
  color?: string
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({ address, style }: AddressBadgeProps) => {
  const theme = useTheme()

  const data = isAddress(address)
    ? address.settings
    : isAddressSettings(address)
    ? address
    : {
        color: theme.font.primary,
        isMain: false,
        label: ''
      }

  return (
    <View style={style}>
      {data.label && (
        <Symbol>{data.isMain ? <StarIcon size={16} fill="#FFD66D" /> : <Dot color={data.color} />}</Symbol>
      )}
      <Label numberOfLines={1}>{data.label || (address as Address).hash}</Label>
    </View>
  )
}

export default styled(AddressBadge)`
  flex-direction: row;
  align-items: center;
`

const Symbol = styled.View`
  margin-right: 10px;
`

const Dot = styled.View<{ color?: string }>`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const Label = styled.Text`
  font-weight: 600;
`
