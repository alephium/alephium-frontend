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
import { colord } from 'colord'
import { motion } from 'framer-motion'
import styled from 'styled-components'

import NFTThumbnail from '@/components/NFTThumbnail'
import Truncate from '@/components/Truncate'

interface NFTCardProps {
  nft: NFT
  onClick?: () => void
}

const NFTCard = ({ nft, onClick }: NFTCardProps) => (
  <NFTCardStyled onClick={onClick}>
    <CardContent>
      <NFTPictureContainer>
        <NFTThumbnail nft={nft} size="100%" />
      </NFTPictureContainer>
      <NFTName>{nft?.name}</NFTName>
    </CardContent>
  </NFTCardStyled>
)

export default NFTCard

const NFTCardStyled = styled.div`
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: var(--radius-huge);
  transition: all cubic-bezier(0.2, 0.65, 0.5, 1) 0.1s;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => colord(theme.bg.background2).darken(0.05).toHex()};
    transform: scale(1.02);
  }
`

const CardContent = styled.div`
  padding: 10px;
`

const NFTPictureContainer = styled(motion.div)`
  position: relative;
  border-radius: var(--radius-big);
  overflow: hidden;
`

const NFTName = styled(Truncate)`
  text-align: center;
  font-weight: 600;
  margin: 10px 0;
  max-width: 100%;
`
