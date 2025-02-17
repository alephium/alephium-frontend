import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { SharedValue, useSharedValue, withSpring } from 'react-native-reanimated'

import { AnimatedBackgroundProps } from '~/components/animatedBackground/animatedBackgroundTypes'

export interface CanvasDimensions {
  canvasHeight: SharedValue<number>
  canvasWidth: SharedValue<number>
}

const useCanvasDimensions = ({ height = 400, width, isFullScreen }: AnimatedBackgroundProps): CanvasDimensions => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  const defaultCanvasHeight = isFullScreen ? screenHeight : height
  const defaultCanvasWidth = width || screenWidth

  const canvasHeight = useSharedValue(defaultCanvasHeight)
  const canvasWidth = useSharedValue(defaultCanvasWidth)

  useEffect(() => {
    canvasHeight.value = withSpring(defaultCanvasHeight, { mass: 5, damping: 60 })
    canvasWidth.value = withSpring(defaultCanvasWidth, { mass: 5, damping: 60 })
  }, [canvasHeight, canvasWidth, defaultCanvasHeight, defaultCanvasWidth])

  return { canvasHeight, canvasWidth }
}

export default useCanvasDimensions
