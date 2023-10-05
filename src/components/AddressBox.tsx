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

import * as Haptics from 'expo-haptics'
import { useMemo } from 'react'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastestSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AddressBadge from '~/components/AddressBadge'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Checkmark from '~/components/Checkmark'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { BORDER_RADIUS } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

interface AddressBoxProps extends PressableProps {
  addressHash: AddressHash
  isSelected?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AddressBox = ({ addressHash, isSelected, onPress, ...props }: AddressBoxProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const theme = useTheme()

  const boxAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(isSelected ? theme.global.accent : theme.border.primary, fastestSpringConfiguration),
    borderWidth: 2
  }))

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    onPress && onPress(e)
  }

  return (
    <AddressBoxStyled {...props} onPress={handlePress} style={[boxAnimatedStyle, props.style]}>
      <AddressBoxTop>
        <AddressBadgeStyled onPress={handlePress} addressHash={addressHash} textStyle={{ fontSize: 18 }} />
        {isSelected && <Checkmark />}
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
  border-radius: ${BORDER_RADIUS}px;
  overflow: hidden;
`

const AddressBoxTop = styled.View`
  padding: 15px;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
`

const AddressBoxBottom = styled.View`
  padding: 13px 15px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 80%;
`

const AssetsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`
