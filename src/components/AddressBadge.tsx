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

interface AddressBadgeProps {
  address: Address | string
  color?: string
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({ address, style }: AddressBadgeProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
      {typeof address === 'string' ? (
        <Label numberOfLines={1}>{address}</Label>
      ) : (
        <>
          <Symbol>
            {address.settings.isMain ? (
              <StarIcon size={16} fill={theme.global.star} />
            ) : (
              <Dot color={address.settings.color} />
            )}
          </Symbol>
          <Label numberOfLines={1}>{address.settings.label || address.hash}</Label>
        </>
      )}
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
  flex-shrink: 1;
`
