import { NFT, selectNFTById } from '@alephium/shared'
import { Image } from 'expo-image'
import { memo, useEffect, useState } from 'react'
import { DimensionValue, Platform } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import NftVideo from '~/components/nft/NftVideo'
import NFTPlaceholder from '~/components/NFTPlaceholder'
import NFTWebView from '~/components/NFTWebView'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

export interface NFTImageProps {
  nftId: NFT['id']
  size?: DimensionValue
  play?: boolean
}

enum NFTDataTypes {
  image = 'image',
  video = 'video',
  audio = 'audio',
  other = 'other'
}

type NFTDataType = keyof typeof NFTDataTypes

const NFTImage = memo(({ nftId, size = '100%', play }: NFTImageProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const theme = useTheme()

  const [hasError, setHasError] = useState(false)
  const [contentType, setContentType] = useState<NFTDataType>()

  useEffect(() => {
    if (nft?.image)
      fetch(nft.image).then((res) => {
        const contentType = res.headers.get('content-type') || ''
        const contentTypeCategory = contentType.split('/')[0]

        setContentType(contentTypeCategory in NFTDataTypes ? (contentTypeCategory as NFTDataType) : 'other')
      })
  }, [nft?.image])

  if (!nft) return null

  const isDataUri = nft.image.startsWith('data:image/')

  if (!contentType) return <NFTPlaceholder size={size} showCameraOff={false} />

  // Loading many videos at once is too heavy on Android.
  // Using the image component for NFT lists on Android is sufficient.
  if (contentType === 'video' && (Platform.OS === 'ios' || play))
    return <NftVideo size={size} videoSource={nft.image} play={play} />

  if (contentType === 'other' || hasError) return <NFTPlaceholder size={size} />

  if (isDataUri) return <NFTWebView imageUri={nft.image} size={size} />

  return (
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
})

export default NFTImage

const NFTImageStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.bg.primary};
`
