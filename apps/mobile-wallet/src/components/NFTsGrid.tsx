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

import { NFT } from '@alephium/shared'
import { Image } from 'expo-image'
import { Skeleton } from 'moti/skeleton'
import { Dimensions } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS_SMALL, DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTsGridProps {
  nfts: NFT[]
  isLoading: boolean
  nftsPerRow?: number
  nftWidth?: number
}

const gap = 12
const screenPadding = 20
const nftsGridPadding = DEFAULT_MARGIN

const NFTsGrid = ({ nfts, isLoading, nftWidth, nftsPerRow = 3 }: NFTsGridProps) => {
  const theme = useTheme()

  const { width: windowWidth } = Dimensions.get('window')
  const totalGapSize = (nftsPerRow - 1) * gap + screenPadding * 2 + nftsGridPadding * 2
  const width = nftWidth ?? (windowWidth - totalGapSize) / nftsPerRow

  return (
    <NFTsGridStyled style={{ paddingRight: nfts.length === 0 ? 15 : 0 }}>
      {nfts.map((nft) => (
        <NFTThumbnail key={nft.id} style={{ width: width }} source={{ uri: nft.image }} transition={500} />
      ))}
      {isLoading && (
        <>
          <Skeleton show colorMode={theme.name} width={width} height={100} />
          <Skeleton show colorMode={theme.name} width={width} height={100} />
          <Skeleton show colorMode={theme.name} width={width} height={100} />
        </>
      )}
      {!isLoading && nfts.length === 0 && (
        <NoNFTsMessage>
          <AppText color={theme.font.tertiary}>No NFTs yet 🖼️</AppText>
        </NoNFTsMessage>
      )}
    </NFTsGridStyled>
  )
}

export default NFTsGrid

const NFTsGridStyled = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 20px 0 0 ${nftsGridPadding}px;
  gap: ${gap}px;
`

const NoNFTsMessage = styled.View`
  text-align: center;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px;
  border-radius: 9px;
  border: 2px dashed ${({ theme }) => theme.border.primary};
`

export const NFTThumbnail = styled(Image)<{ height?: number }>`
  height: ${({ height }) => height ?? 100}px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`
