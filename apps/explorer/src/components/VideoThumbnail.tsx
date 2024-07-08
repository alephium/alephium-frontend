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
import { RiPlayCircleLine } from 'react-icons/ri'
import styled from 'styled-components'

import LoadingSpinner from '@/components/LoadingSpinner'
import { getOrCreateThumbnail, isValidThumbnail, loadThumbnailFromDB, saveThumbnailToDB } from '@/utils/thumbnails'

interface VideoThumbnailProps {
  videoUrl: string
  showPlayIcon?: boolean
}

const VideoThumbnail = ({ videoUrl, showPlayIcon }: VideoThumbnailProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

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

  return (
    <ThumbnailContainer>
      {thumbnailUrl ? (
        <ThumbnailWithOverlay>
          {showPlayIcon && <PlayIcon />}
          <Thumbnail src={thumbnailUrl} alt="Video Thumbnail" />
        </ThumbnailWithOverlay>
      ) : (
        <LoadingSpinner />
      )}
    </ThumbnailContainer>
  )
}

export default VideoThumbnail

const ThumbnailContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ThumbnailWithOverlay = styled.div`
  width: 100%;
  height: 100%;
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
`
