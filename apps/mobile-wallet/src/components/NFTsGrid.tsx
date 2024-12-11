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

import { AddressHash, NFT } from '@alephium/shared'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesNFTs } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTsGridProps extends Omit<Partial<FlashListProps<NFT>>, 'contentContainerStyle'> {
  addressHash?: AddressHash
  nfts?: NFT[]
  nftsPerRow?: number
  nftSize?: number
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const gap = DEFAULT_MARGIN / 2
const containerHorizontalPadding = DEFAULT_MARGIN

const NFTsGrid = forwardRef(
  (
    { addressHash, nfts: nftsProp, nftSize, nftsPerRow = 3, scrollEnabled, ...props }: NFTsGridProps,
    ref: ForwardedRef<FlashList<NFT>>
  ) => {
    const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
    const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
    const isLoadingNfts = useAppSelector((s) => s.nfts.loading)
    const theme = useTheme()
    const { t } = useTranslation()

    const data = nftsProp ?? nfts
    const columns = nftsPerRow
    const { width: windowWidth } = Dimensions.get('window')
    const totalGapSize = 2 * containerHorizontalPadding
    const size = nftSize ?? (windowWidth - totalGapSize) / columns

    return (
      <FlashList
        {...props}
        data={data}
        ref={ref}
        overScrollMode="auto"
        keyExtractor={(item) => item.id}
        renderItem={({ item: nft }) => (
          <NFTThumbnailContainer key={nft.id}>
            <NFTThumbnail nftId={nft.id} />
          </NFTThumbnailContainer>
        )}
        contentContainerStyle={{ paddingHorizontal: containerHorizontalPadding, paddingBottom: 70 }}
        numColumns={columns}
        estimatedItemSize={props.estimatedItemSize || 64}
        ListEmptyComponent={
          <NoNFTsMessage>
            {isLoadingNfts ? (
              <>
                <AppText color={theme.font.tertiary}>👀</AppText>
                <ActivityIndicator />
              </>
            ) : (
              <EmptyPlaceholder>
                <AppText color={theme.font.secondary}>{t('No NFTs yet')} 👻</AppText>
              </EmptyPlaceholder>
            )}
          </NoNFTsMessage>
        }
      />
    )
  }
)

export default NFTsGrid

const NFTThumbnailContainer = styled.View`
  //margin-bottom: ${gap}px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  overflow: hidden;
  padding: 5px;
`

const NoNFTsMessage = styled.View`
  height: 100%;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-radius: 9px;
`
