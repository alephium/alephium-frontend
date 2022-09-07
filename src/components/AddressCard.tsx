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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { colord } from 'colord'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressByHash } from '../store/addressesSlice'
import { themes } from '../style/themes'
import { AddressHash } from '../types/addresses'
import AddressBadge from './AddressBadge'
import Amount from './Amount'

interface AddressCardProps {
  addressHash: AddressHash
  style?: StyleProp<ViewStyle>
}

const AddressCard = ({ style, addressHash }: AddressCardProps) => {
  const theme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))

  if (!address) return null

  const bgColor = address.settings.color ?? theme.font.primary
  const textColor = colord(bgColor).isDark() ? themes.dark.font.primary : themes.light.font.primary

  return (
    <Pressable
      style={[style, { backgroundColor: bgColor }]}
      onPress={() => navigation.navigate('AddressScreen', { addressHash })}
    >
      <Header>
        <AddressBadgeStyled
          address={address}
          hideSymbol
          textStyle={{
            fontSize: 23,
            fontWeight: '700',
            color: textColor
          }}
        />
      </Header>
      {/* Replace ℵ with SVG or use dollar value instead */}
      <AmountStyled value={BigInt(address.networkData.details.balance)} suffix="ℵ" color={textColor} />
    </Pressable>
  )
}

export default styled(AddressCard)`
  border-radius: 16px;
  height: 165px;
  padding: 18px;
  justify-content: space-between;
`

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  max-width: 100%;
  align-items: center;
`

const AddressBadgeStyled = styled(AddressBadge)`
  flex-shrink: 1;
  margin-right: 18px;
`

const AmountStyled = styled(Amount)`
  font-weight: 700;
  font-size: 26px;
`
