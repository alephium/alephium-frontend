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
import { CameraOff } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchNft from '@/api/apiDataHooks/token/useFetchNft'
import SkeletonLoader from '@/components/SkeletonLoader'
import VideoThumbnail from '@/features/thumbnails/VideoThumbnail'

interface NFTThumbnailProps {
  nftId: NFT['id']
  size?: string
  border?: boolean
  borderRadius?: number
  hideIfError?: boolean
  autoPlay?: boolean
  playOnHover?: boolean
  showPlayIconIfVideo?: boolean
  onClick?: () => void
}

const NFTThumbnail = ({ border, borderRadius, onClick, hideIfError, ...props }: NFTThumbnailProps) => {
  const { error } = useFetchNft({ id: props.nftId })

  if (hideIfError && error) return null

  return (
    <NftThumbnailStyled border={border} borderRadius={borderRadius} onClick={onClick} size={props.size}>
      <NftThumbnailMedia {...props} />
    </NftThumbnailStyled>
  )
}

export default NFTThumbnail

const NftThumbnailMedia = memo(({ nftId, size, ...props }: NFTThumbnailProps) => {
  const { t } = useTranslation()

  const { data: nft, isLoading, error: fetchNftError } = useFetchNft({ id: nftId })

  if (isLoading) return <SkeletonLoaderStyled height={size} />

  if (fetchNftError || !nft || (nft && !nft.image)) return <MissingMediaPlaceholder />

  if (nft.dataType === 'image') return <NftThumbnailMediaImage src={nft.image} alt={nft.description} size={size} />

  if (nft.dataType === 'video') return <NftThumbnailMediaVideo {...props} src={nft.image} />

  return <ErrorMessage>{t('Unsupported media type')}</ErrorMessage>
})

interface NftThumbnailMediaImageProps {
  src: string
  alt?: string
  size?: string
}

const NftThumbnailMediaImage = memo(({ src, alt, size }: NftThumbnailMediaImageProps) => {
  const [error, setError] = useState(false)

  if (error) return <MissingMediaPlaceholder />

  return <Image src={src} alt={alt} height={size} width={size} onError={() => setError(true)} />
})

interface NftThumbnailMediaVideoProps
  extends Pick<NFTThumbnailProps, 'playOnHover' | 'autoPlay' | 'showPlayIconIfVideo'> {
  src: string
}

const NftThumbnailMediaVideo = memo(
  ({ src, showPlayIconIfVideo, playOnHover, autoPlay }: NftThumbnailMediaVideoProps) =>
    autoPlay ? (
      <video src={src} autoPlay={autoPlay} loop width="100%" height="100%" preload="auto" muted playsInline />
    ) : (
      <VideoThumbnail videoUrl={src} showPlayIcon={showPlayIconIfVideo} playOnHover={playOnHover} />
    )
)

const MissingMediaPlaceholder = () => (
  <ErrorMessage>
    <CameraOff opacity={0.8} />
  </ErrorMessage>
)

const NftThumbnailStyled = styled.div<Pick<NFTThumbnailProps, 'border' | 'borderRadius' | 'size'>>`
  flex: 1;
  overflow: hidden;
  border-radius: ${({ borderRadius }) => borderRadius || 0}px;
  box-shadow: ${({ theme, border }) => border && `0 0 0 1px ${theme.border.primary}`};
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.font.secondary};
`

const SkeletonLoaderStyled = styled(SkeletonLoader)`
  border-radius: 0;
`
