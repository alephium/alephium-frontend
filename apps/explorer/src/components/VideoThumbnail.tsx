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

import { useEffect, useRef, useState } from 'react'

interface VideoThumbnailProps {
  videoSrc: string
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [thumbnail, setThumbnail] = useState<string>('')

  useEffect(() => {
    const captureThumbnail = () => {
      const video = videoRef.current
      if (video) {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataURL = canvas.toDataURL()
          setThumbnail(dataURL)
        }
      }
    }

    const video = videoRef.current
    if (video) {
      video.setAttribute('crossorigin', 'anonymous')

      const onLoadedMetadata = () => {
        video.currentTime = 0.5
      }

      const onSeeked = () => {
        captureThumbnail()
      }

      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('seeked', onSeeked)

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('seeked', onSeeked)
      }
    }
  }, [videoSrc])

  return (
    <div>
      {thumbnail ? (
        <img src={thumbnail} alt="Video Thumbnail" crossOrigin="anonymous" width="100%" height="100%" />
      ) : (
        <video ref={videoRef} src={videoSrc} style={{ display: 'none' }} />
      )}
    </div>
  )
}
export default VideoThumbnail
