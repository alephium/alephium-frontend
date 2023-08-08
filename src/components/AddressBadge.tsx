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

import { StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectAddressByHash } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

interface AddressBadgeProps {
  addressHash: AddressHash
  hideSymbol?: boolean
  textStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({ addressHash, hideSymbol = false, textStyle, style }: AddressBadgeProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return (
    <View style={style}>
      {!address ? (
        <Label numberOfLines={1} ellipsizeMode="middle" style={textStyle}>
          {addressHash}
        </Label>
      ) : (
        <>
          {!hideSymbol && (
            <Symbol>
              {address.settings.isDefault ? (
                <DefaultAddressBadge size={16} color={address.settings.color} />
              ) : (
                <Dot color={address.settings.color} />
              )}
            </Symbol>
          )}
          {address.settings.label ? (
            <Label numberOfLines={1} style={textStyle}>
              {address.settings.label}
            </Label>
          ) : (
            <Label numberOfLines={1} ellipsizeMode="middle" style={textStyle}>
              {address.hash}
            </Label>
          )}
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

const Label = styled(AppText)`
  font-weight: 600;
  flex-shrink: 1;
`
