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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { useMemo } from 'react'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import Animated from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AddressColorSymbol from '~/components/AddressColorSymbol'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesTokensWorth } from '~/store/addresses/addressesSelectors'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  selectAddressByHash
} from '~/store/addressesSlice'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface AddressBoxProps extends PressableProps {
  addressHash: AddressHash
  isSelected?: boolean
  isLast?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AddressBox = ({ addressHash, isSelected, onPress, isLast, style, ...props }: AddressBoxProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHash))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))

  if (!address) return

  const handlePress = (e: GestureResponderEvent) => {
    vibrate(ImpactStyle.Heavy)
    onPress && onPress(e)
  }

  return (
    <AddressBoxStyled {...props} onPress={handlePress} style={style}>
      <AddressColorSymbol addressHash={addressHash} size={16} />
      <TextualContent style={{ borderBottomWidth: !isLast ? 1 : 0 }}>
        <AddressBoxLeft>
          {address.settings.label && (
            <AddressName numberOfLines={1} ellipsizeMode="middle" semiBold>
              {address.settings.label}
            </AddressName>
          )}
          <AddressHashLabel
            numberOfLines={1}
            ellipsizeMode="middle"
            semiBold={!address?.settings.label}
            color={address.settings.label && theme.font.tertiary}
          >
            {address?.hash}
          </AddressHashLabel>
        </AddressBoxLeft>
        <AddressBoxRight>
          <Amount isFiat value={balanceInFiat} suffix={CURRENCIES[currency].symbol} semiBold />
          <AssetsRow>
            {knownFungibleTokens.map((asset, i) => i < 5 && <AssetLogo key={asset.id} assetId={asset.id} size={15} />)}
            {knownFungibleTokens.length > 5 && (
              <Badge>
                <NbOfAssetsText>+{knownFungibleTokens.length - 5}</NbOfAssetsText>
              </Badge>
            )}
            {nfts.length > 0 && (
              <Badge>
                <NbOfAssetsText>{nfts.length} NFTs</NbOfAssetsText>
              </Badge>
            )}
          </AssetsRow>
        </AddressBoxRight>
      </TextualContent>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressBoxStyled = styled(AnimatedPressable)`
  flex-direction: row;
  align-items: center;
`

const TextualContent = styled.View`
  flex: 1;
  flex-direction: row;
  gap: ${DEFAULT_MARGIN}px;
  align-items: center;
  border-color: ${({ theme }) => theme.border.secondary};
  padding: ${VERTICAL_GAP / 2}px 0;
  margin-left: ${DEFAULT_MARGIN}px;
`

const AddressBoxLeft = styled.View`
  flex: 1;
  gap: ${VERTICAL_GAP / 4}px;
  overflow: hidden;
`

const AddressBoxRight = styled.View`
  flex: 1;
  align-items: flex-end;
  gap: ${VERTICAL_GAP / 4}px;
`

const AddressName = styled(AppText)`
  max-width: 120px;
`

const AddressHashLabel = styled(AppText)`
  max-width: 120px;
`

const AssetsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`

const NbOfAssetsText = styled(AppText)`
  text-align: right;
  font-size: 12px;
`
