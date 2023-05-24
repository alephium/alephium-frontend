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
import { LayoutChangeEvent, View } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import { makeSelectAddressesAssets, selectAllAddresses } from '../store/addressesSlice'
import { Address } from '../types/addresses'
import { sortAssetsByName } from '../utils/assets'
import Carousel from './Carousel'
import HighlightRow from './HighlightRow'
import { ScreenSection, ScreenSectionTitle } from './layout/Screen'
import TokenInfo from './TokenInfo'

const PAGE_SIZE = 3

interface AddressesTokensListProps {
  addresses?: Address[]
}

const AddressesTokensList = ({ addresses: addressesParam }: AddressesTokensListProps) => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const addressDataStatus = useAppSelector((s) => s.addresses.status)
  const addresses = addressesParam ?? allAddresses
  const selectAddressesAssets = useMemo(makeSelectAddressesAssets, [])
  const assets = useAppSelector((s) =>
    selectAddressesAssets(
      s,
      addresses.map(({ hash }) => hash)
    )
  )

  const [carouselItemHeight, setCarouselItemHeight] = useState(258)
  const [isCarouselItemHeightAdapted, setIsCarouselItemHeightAdapted] = useState(false)

  const assetsChunked = chunk(assets.sort(sortAssetsByName), PAGE_SIZE)
  const isLoading = addressDataStatus === 'uninitialized'

  const onLayoutCarouselItem = (event: LayoutChangeEvent) => {
    const newCarouselItemHeight = event.nativeEvent.layout.height

    if (!isCarouselItemHeightAdapted || (isCarouselItemHeightAdapted && newCarouselItemHeight > carouselItemHeight)) {
      setCarouselItemHeight(newCarouselItemHeight)
      setIsCarouselItemHeightAdapted(true)
    }
  }

  const renderCarouselItem = ({ item }: { item: Asset[] }) => (
    <View onLayout={onLayoutCarouselItem}>
      {item.map((asset) => {
        return (
          <HighlightRow key={asset.id}>
            <TokenInfo asset={asset} isLoading={isLoading} />
          </HighlightRow>
        )
      })}
    </View>
  )

  return (
    <>
      {assetsChunked.length > 1 && (
        <>
          <ScreenSectionTitleStyled>Assets</ScreenSectionTitleStyled>
          <Carousel
            data={assetsChunked}
            renderItem={renderCarouselItem}
            padding={20}
            distance={10}
            height={carouselItemHeight}
          />
        </>
      )}
      {assetsChunked.length === 1 && (
        <ScreenSection>
          <ScreenSectionTitle>Assets</ScreenSectionTitle>
          {renderCarouselItem({ item: assetsChunked[0] })}
        </ScreenSection>
      )}
    </>
  )
}

export default AddressesTokensList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: 28px;
`
