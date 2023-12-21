/*
Copyright 2018 - 2023 The Alephium Authors
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
import styled from 'styled-components'

interface NFTThumbnailProps {
  nft: NFT
  className?: string
}

const NFTThumbnail = ({ nft, className }: NFTThumbnailProps) => (
  <NFTThumbnailStyled src={nft.image} alt={nft.description} className={className} />
)

export default NFTThumbnail

const NFTThumbnailStyled = styled.img`
  width: 100px;
  height: 100px;
  border-radius: var(--radius-medium);
  object-fit: cover;
`
