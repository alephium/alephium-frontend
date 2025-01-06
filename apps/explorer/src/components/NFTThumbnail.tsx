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
              <ErrorMessage>{t('Unsupported media type')}</ErrorMessage>
            )
          ) : (
            <ErrorMessage>{t('No media')}</ErrorMessage>
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
  object-fit: contain;
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
