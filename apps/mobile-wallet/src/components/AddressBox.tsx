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
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import { Portal } from 'react-native-portalize'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastestSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Checkmark from '~/components/Checkmark'
import BottomModal from '~/components/layout/BottomModal'
import NFTsGrid from '~/components/NFTsGrid'
import { useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  selectAddressByHash
} from '~/store/addressesSlice'
import { BORDER_RADIUS, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface AddressBoxProps extends PressableProps {
  addressHash: AddressHash
  isSelected?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const AddressBox = ({ addressHash, isSelected, onPress, ...props }: AddressBoxProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const theme = useTheme()
  const { t } = useTranslation()

  const [isNftsModalOpen, setIsNftsModalOpen] = useState(false)

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

  return (
    <AddressBoxStyled {...props} onPress={handlePress} style={[boxAnimatedStyle, props.style]}>
      <AddressBoxTop>
        <AddressBadgeStyled onPress={handlePress} addressHash={addressHash} textStyle={{ fontSize: 18 }} />
        <Group>
          <AppText color="tertiary" size={14}>
            {t('group {{ groupNumber }}', { groupNumber: address?.group })}
          </AppText>
          {isSelected && <Checkmark />}
        </Group>
      </AddressBoxTop>
      <AddressBoxBottom>
        <AssetsRow>
          {knownFungibleTokens.map((asset) => (
            <AssetAmountWithLogo
              key={asset.id}
              assetId={asset.id}
              logoSize={15}
              amount={asset.balance - asset.lockedBalance}
              useTinyAmountShorthand
            />
          ))}
        </AssetsRow>
        {nfts.length > 0 && (
          <Pressable onPress={() => setIsNftsModalOpen(true)}>
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
      </AddressBoxBottom>
      <Portal>
        <BottomModal
          Content={(props) => <NFTsGrid addressHash={addressHash} {...props} />}
          isOpen={isNftsModalOpen}
          onClose={() => setIsNftsModalOpen(false)}
        />
      </Portal>
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
  gap: ${DEFAULT_MARGIN}px;
  align-items: center;
`

const AddressBoxBottom = styled.View`
  padding: 13px 15px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
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
