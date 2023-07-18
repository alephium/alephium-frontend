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

import { Asset } from '@alephium/sdk'
import { chunk } from 'lodash'
import { useMemo, useState } from 'react'
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Carousel from '~/components/Carousel'
import UnknownTokensListItem, { UnknownTokensEntry } from '~/components/UnknownTokensListItem'
import { useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesKnownFungibleTokens,
  selectAllAddresses
} from '~/store/addressesSlice'
import { Address } from '~/types/addresses'

import { ScreenSection } from './layout/Screen'
import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  addresses?: Address[]
  style?: StyleProp<ViewStyle>
}

const PAGE_SIZE = 3

const AddressesTokensList = ({ addresses: addressesParam, style }: AddressesTokensListProps) => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const addresses = addressesParam ?? allAddresses
  const addressHashes = addresses.map(({ hash }) => hash)
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHashes))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHashes))

  const [carouselItemHeight, setCarouselItemHeight] = useState(258)
  const [isCarouselItemHeightAdapted, setIsCarouselItemHeightAdapted] = useState(false)

  const entries =
    unknownTokens.length > 0
      ? [
          ...knownFungibleTokens,
          {
            numberOfUnknownTokens: unknownTokens.length,
            addressHash: addresses.length === 1 ? addresses[0].hash : undefined
          }
        ]
      : knownFungibleTokens
  const entriesChunked = chunk(entries, PAGE_SIZE)

  const onLayoutCarouselItem = (event: LayoutChangeEvent) => {
    const newCarouselItemHeight = event.nativeEvent.layout.height

    if (!isCarouselItemHeightAdapted || (isCarouselItemHeightAdapted && newCarouselItemHeight > carouselItemHeight)) {
      setCarouselItemHeight(newCarouselItemHeight)
      setIsCarouselItemHeightAdapted(true)
    }
  }

  const renderCarouselItem = ({ item }: { item: (Asset | UnknownTokensEntry)[] }) => (
    <View onLayout={onLayoutCarouselItem}>
      {item.map((entry, index) =>
        isAsset(entry) ? (
          <TokenListItem
            key={entry.id}
            asset={entry}
            hideSeparator={index === knownFungibleTokens.length - 1 || (index + 1) % 3 === 0}
          />
        ) : (
          <UnknownTokensListItem entry={entry} key="unknown-tokens" />
        )
      )}
    </View>
  )

  return (
    <View style={style}>
      {entriesChunked.length > 1 && (
        <>
          <ScreenSection>
            <TitleRow>
              <AppText semiBold size={18}>
                Tokens
              </AppText>
            </TitleRow>
          </ScreenSection>
          <Carousel
            data={entriesChunked}
            renderItem={renderCarouselItem}
            padding={20}
            distance={10}
            height={carouselItemHeight}
          />
        </>
      )}
      {entriesChunked.length === 1 && (
        <ScreenSection>
          <TitleRow>
            <AppText semiBold size={18}>
              Tokens
            </AppText>
          </TitleRow>

          {renderCarouselItem({ item: entriesChunked[0] })}
        </ScreenSection>
      )}
    </View>
  )
}

export default AddressesTokensList

const TitleRow = styled.View`
  padding-bottom: 12px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.border.secondary};
`

const isAsset = (item: Asset | UnknownTokensEntry): item is Asset => !!(item as Asset).id
