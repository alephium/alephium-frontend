import { useVideoPlayer, VideoView } from 'expo-video'
import { memo } from 'react'
import styled from 'styled-components/native'

import NftVideoPlayIconOverlay from '~/components/nft/NftVideoPlayIconOverlay'
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

  const video = (
    <VideoViewStyled
      style={{ width: size, height: size }}
      player={player}
      allowsFullscreen={false}
      nativeControls={!!play}
    />
  )

  return play ? video : <NftVideoPlayIconOverlay>{video}</NftVideoPlayIconOverlay>
})

export default NftVideo

const VideoViewStyled = styled(VideoView)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
`
