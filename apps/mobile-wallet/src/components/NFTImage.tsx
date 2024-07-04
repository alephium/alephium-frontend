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

import { NFT, selectNFTById } from '@alephium/shared'
import { Image } from 'expo-image'
import { Skeleton } from 'moti/skeleton'
import { memo, useState } from 'react'
import { View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import NFTPlaceholder from '~/components/NFTPlaceholder'
import NFTWebView from '~/components/NFTWebView'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

export interface NFTImageProps {
  nftId: NFT['id']
  size: number
}

const NFTImage = ({ nftId, size }: NFTImageProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (!nft) return null

  const isDataUri = nft.image.startsWith('data:image/')

  return hasError ? (
    <NFTPlaceholder size={size} />
  ) : isDataUri ? (
    <NFTWebView imageUri={nft.image} size={size} />
  ) : (
    <>
      <NFTImageStyled
        style={{ width: size, height: size }}
        transition={500}
        source={{ uri: nft.image }}
        allowDownscaling
        contentFit="contain"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        placeholder={{
          blurhash: theme.name === 'dark' ? 'L00000fQfQfQfQfQfQfQfQfQfQfQ' : 'L1PGpx-;fQ-;_3fQfQfQfQfQfQfQ'
        }}
      />
      {isLoading && (
        <View style={{ position: 'absolute' }}>
          <Skeleton show colorMode={theme.name} width={size} height={size} radius={BORDER_RADIUS_SMALL} />
        </View>
      )}
    </>
  )
}

const NFTImageStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
`

export default memo(NFTImage)
