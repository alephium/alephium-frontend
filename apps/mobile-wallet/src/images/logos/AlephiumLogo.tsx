import { Canvas, FitBox, Path, rect, useCanvasSize } from '@shopify/react-native-skia'
import { StyleProp, ViewStyle } from 'react-native'

interface AlephiumLogoProps {
  style?: StyleProp<ViewStyle>
  color?: string
}

const AlephiumLogo = ({ style, color }: AlephiumLogoProps) => {
  const {
    ref: canvasRef,
    size: { width, height }
  } = useCanvasSize()

  return (
    <Canvas style={[{ flex: 1 }, style]} ref={canvasRef}>
      <FitBox src={rect(0, 0, 362, 618)} dst={rect(0, 0, width, height)}>
        <Path
          color={color}
          path="M120.692 406.665c0-7.938-6.272-13.284-14.021-11.918l-92.62 16.332C6.303 412.445.03 420.004.03 427.942v175.176c0 7.957 6.272 13.304 14.022 11.937l92.619-16.332c7.749-1.366 14.021-8.925 14.021-16.881V406.665Z"
        />
        <Path
          color={color}
          path="M362.092 14.415c0-7.938-6.272-13.284-14.021-11.918l-92.62 16.332c-7.749 1.366-14.021 8.925-14.021 16.863v175.176c0 7.957 6.272 13.304 14.022 11.937l92.619-16.332c7.749-1.366 14.021-8.925 14.021-16.881V14.415Z"
        />
        <Path
          color={color}
          path="M135.718 55.293c-3.577-7.88-13.193-13.072-21.496-11.608L14.988 61.183c-8.302 1.464-12.129 9.026-8.551 16.906l219.74 484.056c3.578 7.88 13.214 13.117 21.517 11.653l99.234-17.498c8.303-1.464 12.108-9.072 8.53-16.952L135.719 55.293Z"
        />
      </FitBox>
    </Canvas>
  )
}

export default AlephiumLogo
