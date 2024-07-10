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

import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { queries } from '@/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import VideoThumbnail from '@/components/VideoThumbnail'

interface NFTThumbnailProps {
  src?: string
  size?: number
  border?: boolean
  borderRadius?: number
  autoPlay?: boolean
  playOnHover?: boolean
  showPlayIconIfVideo?: boolean
}

const NFTThumbnail = memo(
  ({ src, size, border, borderRadius, autoPlay, showPlayIconIfVideo, playOnHover }: NFTThumbnailProps) => {
    const { t } = useTranslation()
    const theme = useTheme()

    const { data: dataType, isLoading: isDataTypeLoading } = useQuery({
      ...queries.assets.NFTsData.type(src || ''),
      enabled: !!src
    })

    return (
      <Container
        style={{
          borderRadius: borderRadius || 0,
          boxShadow: border ? `0 0 0 1px ${theme.border.primary}` : 'initial',
          height: size,
          width: size
        }}
      >
        {!isDataTypeLoading ? (
          src ? (
            dataType === 'image' ? (
              <Image src={src} height={size} width={size} />
            ) : dataType === 'video' ? (
              autoPlay ? (
                <video src={src} autoPlay={autoPlay} loop width="100%" height="100%" preload="auto" muted playsInline />
              ) : (
                <VideoThumbnail videoUrl={src} showPlayIcon={showPlayIconIfVideo} playOnHover={playOnHover} />
              )
            ) : (
              t('Unsupported media type')
            )
          ) : (
            t('Missing image')
          )
        ) : (
          <SpinnerContainer>
            <LoadingSpinner />
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
  max-width: 600px;
`

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`

export default NFTThumbnail
