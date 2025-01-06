import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiPlayCircleLine } from 'react-icons/ri'
import styled from 'styled-components'

import Spinner from '@/components/Spinner'
import { fetchThumbnailUrl } from '@/features/thumbnails/thumbnailStorage'

interface VideoThumbnailProps {
  videoUrl: string
  showPlayIcon?: boolean
  playOnHover?: boolean
}

const VideoThumbnail = ({ videoUrl, showPlayIcon, playOnHover }: VideoThumbnailProps) => {
  const { t } = useTranslation()
  const [thumbnailUrl, setThumbnailUrl] = useState<string>()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    try {
      fetchThumbnailUrl(videoUrl).then(setThumbnailUrl)
    } catch (error) {
      console.error('Error fetching thumbnail:', error)
    }
  }, [videoUrl])

  const handlePointerEnter = () => {
    if (playOnHover) {
      setIsHovered(true)
    }
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
  }

  return (
    <FullSizeContainer onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
      {thumbnailUrl ? (
        <FullSizeContainer>
          <Thumbnail
            src={thumbnailUrl}
            alt={t('Video thumbnail')}
            style={{ filter: isHovered ? 'blur(10px)' : undefined }}
          />
          {showPlayIcon && <PlayIcon />}
          {playOnHover && isHovered && (
            <VideoContainer>
              <video src={videoUrl} autoPlay loop width="100%" height="100%" preload="auto" muted playsInline />
            </VideoContainer>
          )}
        </FullSizeContainer>
      ) : (
        <Spinner />
      )}
    </FullSizeContainer>
  )
}

export default VideoThumbnail

const FullSizeContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PlayIcon = styled(RiPlayCircleLine)`
  position: absolute;
  font-size: 3rem;
  color: white;
`

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(0);
  transition: filter 0.3s ease-in-out;
`

const VideoContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
`
