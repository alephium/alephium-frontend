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
import { X } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchNft from '@/api/apiDataHooks/token/useFetchNft'
import Spinner from '@/components/Spinner'
import VideoThumbnail from '@/features/thumbnails/VideoThumbnail'

interface NFTThumbnailProps {
  nftId: NFT['id']
  size?: number | string
  border?: boolean
  borderRadius?: number
  hideIfError?: boolean
  autoPlay?: boolean
  playOnHover?: boolean
  showPlayIconIfVideo?: boolean
}

const NFTThumbnail = memo(
  ({
    nftId,
    size,
    border,
    hideIfError,
    borderRadius,
    autoPlay,
    showPlayIconIfVideo,
    playOnHover
  }: NFTThumbnailProps) => {
    const { t } = useTranslation()
    const theme = useTheme()

    const { data: nft, error, isLoading } = useFetchNft({ id: nftId })

    if (error && !hideIfError)
      return (
        <ErrorMessage>
          <X />
        </ErrorMessage>
      )

    const src = nft?.image

    return (
      <Container
        style={{
          borderRadius: borderRadius || 0,
          boxShadow: border ? `0 0 0 1px ${theme.border.primary}` : 'initial',
          height: size,
          width: size
        }}
      >
        {!isLoading ? (
          src ? (
            nft.dataType === 'image' ? (
              <Image src={src} height={size} width={size} />
            ) : nft.dataType === 'video' ? (
              autoPlay ? (
                <video src={src} autoPlay={autoPlay} loop width="100%" height="100%" preload="auto" muted playsInline />
              ) : (
                <VideoThumbnail videoUrl={src} showPlayIcon={showPlayIconIfVideo} playOnHover={playOnHover} />
              )
            ) : (
              <ErrorMessage>{t('Unsupported media type')}</ErrorMessage>
            )
          ) : (
            <ErrorMessage>{t('No media')}</ErrorMessage>
          )
        ) : (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        )}
      </Container>
    )
  }
)

const Container = styled.div`
  flex: 1;
  overflow: hidden;
`

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.font.secondary};
`

export default NFTThumbnail
