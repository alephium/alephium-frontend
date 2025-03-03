import { NFT, selectNFTById } from '@alephium/shared'
import { Image } from 'expo-image'
import { CameraOff, FileImage } from 'lucide-react-native'
import { memo, useState } from 'react'
import { DimensionValue, Platform } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import NftVideo from '~/components/nft/NftVideo'
import NftVideoPlayIconOverlay from '~/components/nft/NftVideoPlayIconOverlay'
import NFTPlaceholder from '~/components/NFTPlaceholder'
import NFTWebView from '~/components/NFTWebView'
import useIsNftCached from '~/features/assetsDisplay/nftsDisplay/useIsNftCached'
import useNftHeaderData from '~/features/assetsDisplay/nftsDisplay/useNftHeaderData'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

export interface NFTImageProps {
  nftId: NFT['id']
  size?: DimensionValue
  play?: boolean
  sizeLimited?: boolean
}

const maxFileSizeInMB = 1
const maxFileSizeInBytes = 1024 * 1024 * maxFileSizeInMB

const NFTImage = memo(({ nftId, size = '100%', play, sizeLimited = true }: NFTImageProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const isCached = useIsNftCached(nftId)
  const { contentType, isLargeFile } = useNftHeaderData({ nftId, maxFileSizeInBytes })
  const theme = useTheme()

  const [hasError, setHasError] = useState(false)

  if (!nft) return null

  if (!contentType) return <NFTPlaceholder size={size} />

  if (sizeLimited && !isCached && isLargeFile)
    return <NFTPlaceholder size={size} Icon={FileImage} text={`>${maxFileSizeInMB}MB`} />

  // Loading many videos at once is too heavy on Android.
  // Using the image component for NFT lists on Android is sufficient.
  if (contentType === 'video' && (Platform.OS !== 'android' || play))
    return <NftVideo size={size} videoSource={nft.image} play={play} />

  if (contentType === 'other' || hasError) return <NFTPlaceholder size={size} Icon={CameraOff} />

  const isDataUri = nft.image.startsWith('data:image/')

  if (isDataUri) return <NFTWebView imageUri={nft.image} size={size} />

  const image = (
    <NFTImageStyled
      style={{ width: size, height: size }}
      transition={500}
      source={{ uri: nft.image }}
      allowDownscaling
      contentFit="contain"
      onError={() => setHasError(true)}
      placeholder={{
        blurhash: theme.name === 'dark' ? 'L00000fQfQfQfQfQfQfQfQfQfQfQ' : 'L1PGpx-;fQ-;_3fQfQfQfQfQfQfQ'
      }}
    />
  )

  return contentType === 'video' ? <NftVideoPlayIconOverlay>{image}</NftVideoPlayIconOverlay> : image
})

export default NFTImage

const NFTImageStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.bg.primary};
`
