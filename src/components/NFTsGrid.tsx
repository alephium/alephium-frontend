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

import { Skeleton } from 'moti/skeleton'
import { Dimensions } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'
import { NFT } from '~/types/assets'

interface NFTsGridProps {
  nfts: NFT[]
  isLoading: boolean
}

const gap = 12
const screenPadding = 20
const nftsPerRow = 3
const totalGapSize = (nftsPerRow - 1) * gap + screenPadding * 2

const NFTsGrid = ({ nfts, isLoading }: NFTsGridProps) => {
  const theme = useTheme()

  const { width: windowWidth } = Dimensions.get('window')
  const nftWidth = (windowWidth - totalGapSize) / nftsPerRow

  return (
    <NFTsGridStyled gap={gap} screenPadding={screenPadding}>
      {nfts.map((nft) => (
        <NFTThumbnail key={nft.id} style={{ width: nftWidth }} source={{ uri: nft.image }} />
      ))}
      {isLoading && (
        <>
          <Skeleton show colorMode={theme.name} width={nftWidth} height={100} />
          <Skeleton show colorMode={theme.name} width={nftWidth} height={100} />
          <Skeleton show colorMode={theme.name} width={nftWidth} height={100} />
        </>
      )}
      {!isLoading && nfts.length === 0 && (
        <NoNFTsMessage>
          <AppText color={theme.font.tertiary}>No NFTs yet.</AppText>
        </NoNFTsMessage>
      )}
    </NFTsGridStyled>
  )
}

export default NFTsGrid

const NFTsGridStyled = styled.View<{ gap: number; screenPadding: number }>`
  flex-direction: row;
  flex-wrap: wrap;
  padding: ${({ screenPadding }) => `20px 0 0 ${screenPadding}px`};
  gap: ${({ gap }) => gap}px;
`

const NoNFTsMessage = styled.View`
  text-align: center;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  padding: 20px;
  border-radius: 9px;
  border: 2px dashed ${({ theme }) => theme.border.primary};
`

const NFTThumbnail = styled.Image`
  height: 100px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`
