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
import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { ModalContentProps } from '~/components/layout/ModalContent'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesNFTs } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTsGridProps extends ModalContentProps {
  addressHash?: AddressHash
  nfts?: NFT[]
  nftsPerRow?: number
  nftSize?: number
}

const gap = 12
const screenPadding = DEFAULT_MARGIN

const NFTsGrid = ({ addressHash, nfts: nftsProp, nftSize, nftsPerRow = 3 }: NFTsGridProps) => {
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const theme = useTheme()
  const { t } = useTranslation()

  const data = nftsProp ?? nfts
  const columns = nftsPerRow
  const { width: windowWidth } = Dimensions.get('window')
  const totalGapSize = (columns - 1) * gap + screenPadding * 2
  const size = nftSize ?? (windowWidth - totalGapSize) / columns

  return (
    <FlashList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item: nft }) => <NFTThumbnail key={nft.id} nftId={nft.id} size={size} />}
      numColumns={columns}
      estimatedItemSize={64}
      ListEmptyComponent={
        <NoNFTsMessage>
          <AppText color={theme.font.tertiary}>{t('No NFTs yet')} 🖼️</AppText>
        </NoNFTsMessage>
      }
    />
  )
}

export default NFTsGrid

const NoNFTsMessage = styled.View`
  text-align: center;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px;
  border-radius: 9px;
  border: 2px dashed ${({ theme }) => theme.border.primary};
  margin: 15px;
`
