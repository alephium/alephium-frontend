import { NFT } from '@alephium/shared'
import { useFetchNft } from '@alephium/shared-react'
import { CameraOff } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
  const { data: nft, isLoading, error: fetchNftError } = useFetchNft({ id: nftId })

  if (isLoading) return <SkeletonLoaderStyled height={size} />

  if (fetchNftError || !nft || (nft && !nft.image)) return <MissingMediaPlaceholder />

  if (nft.dataType === 'video') return <NftThumbnailMediaVideo {...props} src={nft.image} />

  // TODO: Add support for audio, possibly with an `audio` element

  return <NftThumbnailMediaImage src={nft.image} alt={nft.description} size={size} />
})

interface NftThumbnailMediaImageProps {
  src: string
  alt?: string
  size?: string
}

const NftThumbnailMediaImage = memo(({ src, alt, size }: NftThumbnailMediaImageProps) => {
  const { t } = useTranslation()
  const [error, setError] = useState(false)

  if (error) return <ErrorMessage>{t('Unsupported media type')}</ErrorMessage>

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
  flex-grow: 1;
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
