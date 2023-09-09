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
import { StyleProp, TextStyle, TouchableNativeFeedback, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectAddressByHash } from '~/store/addressesSlice'
import { BORDER_RADIUS } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'
import { copyAddressToClipboard } from '~/utils/addresses'

interface AddressBadgeProps {
  addressHash: AddressHash
  hideSymbol?: boolean
  textStyle?: StyleProp<TextStyle>
  showCopyBtn?: boolean
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({ addressHash, hideSymbol = false, textStyle, showCopyBtn, style }: AddressBadgeProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return (
    <TouchableNativeFeedback onLongPress={() => !showCopyBtn && copyAddressToClipboard(addressHash)}>
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
        {showCopyBtn && address?.hash && (
          <CopyAddressButton
            onPress={() => copyAddressToClipboard(address?.hash)}
            iconProps={{ name: 'copy-outline' }}
            type="transparent"
            round
            compact
          />
        )}
      </View>
    </TouchableNativeFeedback>
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

const CopyAddressButton = styled(Button)``
