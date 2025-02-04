import { useVideoPlayer, VideoView } from 'expo-video'
import { memo } from 'react'
import styled from 'styled-components/native'

import { NFTImageProps } from '~/components/NFTImage'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

export interface NftVideoProps extends Pick<NFTImageProps, 'play' | 'size'> {
  videoSource: string
}

const NftVideo = memo(({ videoSource, play, size }: NftVideoProps) => {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true

    if (play) player.play()
  })

  return (
    <VideoViewStyled
      style={{ width: size, height: size }}
      player={player}
      allowsFullscreen={false}
      allowsPictureInPicture
      nativeControls={!!play}
    />
  )
})

export default NftVideo

const VideoViewStyled = styled(VideoView)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
`
