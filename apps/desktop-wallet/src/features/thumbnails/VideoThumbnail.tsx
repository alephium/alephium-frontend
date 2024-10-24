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

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiPlayCircleLine } from 'react-icons/ri'
import styled from 'styled-components'

import Spinner from '@/components/Spinner'
import {
  getOrCreateThumbnail,
  isValidThumbnail,
  loadThumbnailFromDB,
  saveThumbnailToDB
} from '@/features/thumbnails/thumbnailStorage'

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
    const fetchThumbnail = async () => {
      try {
        const cachedBlob = await loadThumbnailFromDB(videoUrl)
        if (cachedBlob && isValidThumbnail(cachedBlob)) {
          const cachedUrl = URL.createObjectURL(cachedBlob)
          setThumbnailUrl(cachedUrl)
          return
        }

        const generatedThumbnailBlob = await getOrCreateThumbnail(videoUrl)
        const generatedThumbnailUrl = URL.createObjectURL(generatedThumbnailBlob)
        setThumbnailUrl(generatedThumbnailUrl)
        await saveThumbnailToDB(videoUrl, generatedThumbnailBlob)
      } catch (error) {
        console.error('Error loading thumbnail:', error)
      }
    }

    fetchThumbnail()
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
            style={{ filter: isHovered ? 'blur(30px)' : undefined }}
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
