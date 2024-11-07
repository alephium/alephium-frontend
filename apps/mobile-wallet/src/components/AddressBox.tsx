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
import { groupBy } from 'lodash'
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastestSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Checkmark from '~/components/Checkmark'
import { openModal } from '~/features/modals/modalActions'
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
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AddressBox = ({ addressHash, isSelected, onPress, ...props }: AddressBoxProps) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHash))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const theme = useTheme()
  const { t } = useTranslation()

  const boxAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(isSelected ? theme.global.accent : theme.border.primary, fastestSpringConfiguration),
    borderWidth: 2
  }))

  const handlePress = (e: GestureResponderEvent) => {
    vibrate(ImpactStyle.Heavy)
    onPress && onPress(e)
  }

  const nftsGroupedByCollection = groupBy(nfts, 'collectionId')
  const nbOfNftCollections = Object.keys(nftsGroupedByCollection).length

  const openNftsGridModal = () => dispatch(openModal({ name: 'NftGridModal', props: { addressHash } }))

  return (
    <AddressBoxStyled {...props} onPress={handlePress} style={[boxAnimatedStyle, props.style]}>
      <AddressBoxLeft>
        <AddressBadgeStyled onPress={handlePress} addressHash={addressHash} textStyle={{ fontSize: 18 }} />
        <Group>
          <AppText color="tertiary">{t('group {{ groupNumber }}', { groupNumber: address?.group })}</AppText>
          {isSelected && <Checkmark />}
        </Group>
      </AddressBoxLeft>
      <AddressBoxRight>
        <Amount isFiat>{balanceInFiat}</Amount>
        <AssetsRow>
          {knownFungibleTokens.map((asset) => (
            <AssetLogo key={asset.id} assetId={asset.id} size={15} />
          ))}
        </AssetsRow>
        {nfts.length > 0 && (
          <Pressable onPress={openNftsGridModal}>
            <AssetsRow style={{ marginTop: VERTICAL_GAP }}>
              <NbOfNftsBadge>
                <AppText>
                  <Trans
                    t={t}
                    i18nKey="numberOfNFTsInCollections"
                    values={{
                      nftsNumber: nfts.length,
                      nftsCollectionsNumber: nbOfNftCollections
                    }}
                    components={{
                      1: <AppText bold />
                    }}
                  >
                    {'+<1>{{ nftsNumber }}</1> NFTs in <1>{{ nftsCollectionsNumber }}</1> collections'}
                  </Trans>
                </AppText>
              </NbOfNftsBadge>
            </AssetsRow>
          </Pressable>
        )}
      </AddressBoxRight>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressBoxStyled = styled(AnimatedPressable)`
  flex-direction: row;
`

const AddressBoxLeft = styled.View`
  flex: 1;
  padding: 15px;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  gap: ${DEFAULT_MARGIN}px;
  align-items: center;
`

const AddressBoxRight = styled.View`
  flex: 1;
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 80%;
  flex-shrink: 1;
`

const AssetsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`

const Group = styled.View`
  flex-direction: row;
  gap: ${DEFAULT_MARGIN}px;
  flex-shrink: 0;
  align-items: center;
`

const NbOfNftsBadge = styled.View`
  flex-direction: row;
  padding: 3px 7px 3px 3px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-radius: 24px;
  align-items: center;
`
