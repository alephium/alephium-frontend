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
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectContactByHash } from '~/store/addresses/addressesSelectors'
import { selectAddressByHash } from '~/store/addressesSlice'
import { copyAddressToClipboard } from '~/utils/addresses'
import { stringToColour } from '~/utils/colors'

interface AddressBadgeProps extends PressableProps {
  addressHash: AddressHash
  hideSymbol?: boolean
  textStyle?: StyleProp<TextStyle>
  color?: string
  showCopyBtn?: boolean
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({
  addressHash,
  hideSymbol = false,
  textStyle,
  color,
  showCopyBtn,
  ...props
}: AddressBadgeProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const contact = useAppSelector((s) => selectContactByHash(s, addressHash))

  const textColor = color || theme.font.primary

  return (
    <Pressable onLongPress={() => !showCopyBtn && copyAddressToClipboard(addressHash)} {...props}>
      {address ? (
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
            <Label numberOfLines={1} style={[textStyle]} color={textColor}>
              {address.settings.label}
            </Label>
          ) : (
            <Label numberOfLines={1} ellipsizeMode="middle" style={[textStyle]} color={textColor}>
              {address.hash}
            </Label>
          )}
        </>
      ) : contact ? (
        <>
          {!hideSymbol && (
            <Symbol>
              <Dot color={stringToColour(contact.address)} />
            </Symbol>
          )}
          <Label numberOfLines={1} style={[textStyle]} color={textColor}>
            {contact.name}
          </Label>
        </>
      ) : (
        <Label numberOfLines={1} ellipsizeMode="middle" style={[textStyle]} color={textColor}>
          {addressHash}
        </Label>
      )}
      {showCopyBtn && address?.hash && (
        <CopyAddressButton
          onPress={() => copyAddressToClipboard(address?.hash)}
          iconProps={{ name: 'copy-outline' }}
          type="transparent"
          color={color}
          round
          compact
        />
      )}
    </Pressable>
  )
}

export default styled(AddressBadge)`
  flex-direction: row;
  align-items: center;
`

const Symbol = styled.View`
  margin-right: 5px;
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
