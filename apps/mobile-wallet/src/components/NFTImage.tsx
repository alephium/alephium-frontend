import { NFT, selectNFTById } from '@alephium/shared'
import { Image } from 'expo-image'
import { memo, useState } from 'react'
import { DimensionValue } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import NFTPlaceholder from '~/components/NFTPlaceholder'
import NFTWebView from '~/components/NFTWebView'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

export interface NFTImageProps {
  nftId: NFT['id']
  size?: DimensionValue
}

const NFTImage = ({ nftId, size = '100%' }: NFTImageProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const theme = useTheme()

  const [hasError, setHasError] = useState(false)

  if (!nft) return null

  const isDataUri = nft.image.startsWith('data:image/')

  return hasError ? (
    <NFTPlaceholder size={size} />
  ) : isDataUri ? (
    <NFTWebView imageUri={nft.image} size={size} />
  ) : (
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
}

const NFTImageStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
`

export default memo(NFTImage)
