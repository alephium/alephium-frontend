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
import { Skeleton } from 'moti/skeleton'
import { useEffect, useMemo, useState } from 'react'
import { FlatList, LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Carousel from '~/components/Carousel'
import UnknownTokensListItem, { UnknownTokensEntry } from '~/components/UnknownTokensListItem'
import { useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs
} from '~/store/addressesSlice'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

import { ScreenSection } from './layout/Screen'
import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  address?: AddressHash
  style?: StyleProp<ViewStyle>
}

type LoadingIndicator = {
  isLoadingTokens: boolean
}

type CarouselPageEntry = Asset | UnknownTokensEntry | LoadingIndicator

const PAGE_SIZE = 3

const AddressesTokensList = ({ address: addressParam, style }: AddressesTokensListProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressParam))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressParam))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressParam))
  const isLoadingTokenBalances = useAppSelector((s) => s.addresses.loadingTokens)
  const isLoadingTokensMetadata = useAppSelector((s) => s.assetsInfo.loading)
  const theme = useTheme()

  const [carouselItemHeight, setCarouselItemHeight] = useState(258)
  const [isCarouselItemHeightAdapted, setIsCarouselItemHeightAdapted] = useState(false)
  const [carouselData, setCarouselData] = useState<CarouselPageEntry[][]>([])

  useEffect(() => {
    const entries: CarouselPageEntry[] = [
      ...knownFungibleTokens,
      ...(unknownTokens.length > 0
        ? [
            {
              numberOfUnknownTokens: unknownTokens.length,
              addressHash: addressParam
            }
          ]
        : []),
      ...(isLoadingTokenBalances || isLoadingTokensMetadata ? [{ isLoadingTokens: true }] : [])
    ]

    const entriesChunked = chunk(entries, PAGE_SIZE)

    setCarouselData(entriesChunked)
  }, [addressParam, isLoadingTokenBalances, isLoadingTokensMetadata, knownFungibleTokens, unknownTokens.length])

  const onLayoutCarouselItem = (event: LayoutChangeEvent) => {
    const newCarouselItemHeight = event.nativeEvent.layout.height

    if (!isCarouselItemHeightAdapted || (isCarouselItemHeightAdapted && newCarouselItemHeight > carouselItemHeight)) {
      setCarouselItemHeight(newCarouselItemHeight)
      setIsCarouselItemHeightAdapted(true)
    }
  }

  const renderCarouselItem = ({ item }: { item: CarouselPageEntry[] }) => (
    <View onLayout={onLayoutCarouselItem}>
      {item.map((entry, index) =>
        isAsset(entry) ? (
          <TokenListItem
            key={entry.id}
            asset={entry}
            hideSeparator={
              (index === knownFungibleTokens.length - 1 && unknownTokens.length === 0) || (index + 1) % 3 === 0
            }
          />
        ) : isUnknownTokens(entry) ? (
          <UnknownTokensListItem entry={entry} key="unknown-tokens" />
        ) : (
          <LoadingRow key="loading">
            <Skeleton show colorMode={theme.name} width={36} height={36} radius="round" />
            <Skeleton show colorMode={theme.name} width={200} height={36} />
          </LoadingRow>
        )
      )}
    </View>
  )

  return (
    <View style={style}>
      {carouselData.length > 1 && (
        <>
          <ScreenSection>
            <TitleRow>
              <AppText semiBold size={18}>
                Tokens
              </AppText>
            </TitleRow>
          </ScreenSection>
          <Carousel
            data={carouselData}
            renderItem={renderCarouselItem}
            padding={20}
            distance={10}
            height={carouselItemHeight}
          />
        </>
      )}
      {carouselData.length === 1 && (
        <ScreenSection>
          <TitleRow>
            <AppText semiBold size={18}>
              Tokens
            </AppText>
          </TitleRow>

          {renderCarouselItem({ item: carouselData[0] })}
        </ScreenSection>
      )}

      {nfts.length > 0 && (
        <>
          <ScreenSection>
            <TitleRow>
              <AppText semiBold size={18}>
                NFTs
              </AppText>
            </TitleRow>
          </ScreenSection>
          <FlatList
            horizontal
            data={nfts}
            renderItem={({ item: nft, index }) => (
              <NFTThumbnail source={{ uri: nft.image }} isFirst={index === 0} isLast={index === nfts.length - 1} />
            )}
          />
        </>
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

const NFTThumbnail = styled.Image<{ isFirst: boolean; isLast: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
  margin: 16px 10px 16px 0;

  ${({ isFirst }) =>
    isFirst &&
    css`
      margin-left: 20px;
    `}

  ${({ isLast }) =>
    isLast &&
    css`
      margin-right: 20px;
    `}
`

const LoadingRow = styled.View`
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  padding-top: 16px;
`

const isAsset = (item: CarouselPageEntry): item is Asset => !!(item as Asset).id

const isUnknownTokens = (item: CarouselPageEntry): item is UnknownTokensEntry =>
  !!(item as UnknownTokensEntry).numberOfUnknownTokens
