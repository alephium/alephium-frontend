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

import { colord } from 'colord'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addressesSlice'
import { themes } from '~/style/themes'
import { AddressHash } from '~/types/addresses'

interface AddressCardProps {
  addressHash: AddressHash
  style?: StyleProp<ViewStyle>
}

const AddressCard = ({ style, addressHash }: AddressCardProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  const bgColor = address.settings.color ?? theme.font.primary
  const textColor = colord(bgColor).isDark() ? themes.dark.font.primary : themes.light.font.primary

  return (
    <Pressable style={[style, { backgroundColor: bgColor }]}>
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
      <Amount value={BigInt(address.balance)} color="primary" size={26} bold />
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
