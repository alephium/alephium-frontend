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
import { CameraOff } from 'lucide-react'
import { useState } from 'react'
import ReactPlayer from 'react-player'
import styled, { css } from 'styled-components'

import useFetchNft from '@/api/apiDataHooks/token/useFetchNft'
import SkeletonLoader from '@/components/SkeletonLoader'

interface NFTThumbnailProps {
  nftId: NFT['id']
  size?: string
  onClick?: () => void
  className?: string
}

const NFTThumbnail = ({ nftId, size = '100', ...props }: NFTThumbnailProps) => {
  const { data: nft, isLoading } = useFetchNft({ id: nftId })

  const [error, setError] = useState(false)

  if (isLoading) return <SkeletonLoader height={size} />

  if (!nft) return null

  if (nft.image.endsWith('.mp4'))
    return <ReactPlayerStyled url={nft.image} playing loop muted width={size} height={size} />

  if (nft.image && !error)
    return (
      <NFTThumbnailStyled
        src={nft.image}
        alt={nft.description}
        width={size}
        height={size}
        onError={() => setError(true)}
        {...props}
      />
    )

  return (
    <NoImagePlaceHolder>
      <CameraOff opacity={0.8} />
    </NoImagePlaceHolder>
  )
}

export default NFTThumbnail

const NFTThumbnailStyled = styled.img<Pick<NFTThumbnailProps, 'onClick'>>`
  border-radius: var(--radius-medium);
  object-fit: cover;

  ${({ onClick }) =>
    onClick &&
    css`
      cursor: pointer;
    `}
`

const ReactPlayerStyled = styled(ReactPlayer)`
  overflow: hidden;
  border-radius: var(--radius-medium);
`

const NoImagePlaceHolder = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => colord(theme.bg.background2).darken(0.07).toHex()};
  min-height: 140px;
  min-width: 140px;
  border-radius: var(--radius-big);
`
