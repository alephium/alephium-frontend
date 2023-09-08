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

import { Check } from 'lucide-react-native'
import { useMemo } from 'react'
import { Pressable, PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AddressBadge from '~/components/AddressBadge'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

interface AddressBoxProps extends PressableProps {
  addressHash: AddressHash
  isSelected?: boolean
  isFirst?: boolean
  isLast?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AddressBox = ({ addressHash, isSelected, ...props }: AddressBoxProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const theme = useTheme()

  const boxAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(isSelected ? theme.global.accent : theme.border.primary, fastSpringConfiguration),
    borderWidth: 2
  }))

  return (
    <AddressBoxStyled {...props} style={boxAnimatedStyle}>
      <AddressBoxTop>
        <AddressBadgeStyled addressHash={addressHash} textStyle={{ fontSize: 18 }} />
        {isSelected && (
          <Checkmark>
            <Check color="white" size={15} strokeWidth={3} />
          </Checkmark>
        )}
      </AddressBoxTop>
      <AddressBoxBottom>
        <AssetsRow>
          {knownFungibleTokens.map((asset) => (
            <AssetAmountWithLogo
              key={asset.id}
              assetId={asset.id}
              logoSize={15}
              amount={asset.balance - asset.lockedBalance}
            />
          ))}
        </AssetsRow>
      </AddressBoxBottom>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressBoxStyled = styled(AnimatedPressable)`
  border-radius: 9px;
  overflow: hidden;
`

const AddressBoxTop = styled.View`
  padding: 15px;
  flex-direction: row;
  justify-content: space-between;
`

const AddressBoxBottom = styled.View`
  padding: 13px 15px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.secondary};
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 80%;
`

const Checkmark = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.global.accent};
  align-items: center;
  justify-content: center;
`

const AssetsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`
