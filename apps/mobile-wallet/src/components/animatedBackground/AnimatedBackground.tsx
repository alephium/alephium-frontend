/*
This component is energy intensive and should be used consciously.
Prefer using the ScreenAnimatedBackground when using it on a screen.
*/

import { Blur, Canvas as SkiaCanvas, Group } from '@shopify/react-native-skia'
// 1) Import colord (and extend if needed)
import { ReactNode } from 'react'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { AnimatedBackgroundProps } from '~/components/animatedBackground/animatedBackgroundTypes'
import { Circles, GyroscopeCircles } from '~/components/animatedBackground/Circles'
import useCanvasDimensions, { CanvasDimensions } from '~/components/animatedBackground/useCanvasDimentions'
// If you need plugins (like `colord` plugins), you can import and `extend` them here
// import { extend } from 'colord'
// extend([/* plugins */])
import AlephiumLogo from '~/images/logos/AlephiumLogo'

const AnimatedBackground = ({
  height,
  width,
  scrollY,
  isAnimated = true,
  usesGyroscope = true,
  isFullScreen,
  showAlephiumLogo,
  shade
}: AnimatedBackgroundProps) => {
  const { canvasHeight, canvasWidth } = useCanvasDimensions({ height, width, isFullScreen })
  const isDark = useTheme().name === 'dark'

  const circlesProps = { canvasHeight, canvasWidth, shade, isAnimated, isDark }

  return (
    <ParallaxAnimatedContainer scrollY={scrollY}>
      <AnimatedCanvas canvasHeight={canvasHeight} canvasWidth={canvasWidth}>
        <Group>{usesGyroscope ? <GyroscopeCircles {...circlesProps} /> : <Circles {...circlesProps} />}</Group>
        <Blur blur={70} />
      </AnimatedCanvas>

      {showAlephiumLogo && (
        <AlephiumLogoContainer>
          <AlephiumLogo color="white" style={{ width: '15%' }} />
        </AlephiumLogoContainer>
      )}
    </ParallaxAnimatedContainer>
  )
}

export default AnimatedBackground

interface ParallaxAnimatedContainerProps extends Pick<AnimatedBackgroundProps, 'scrollY'> {
  children: ReactNode
}

const ParallaxAnimatedContainer = ({ children, scrollY }: ParallaxAnimatedContainerProps) => {
  const parallaxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY?.get() || 0, [-200, 200], [-30, 30], Extrapolation.CLAMP)
      }
    ]
  }))

  return <AnimatedContainer style={parallaxAnimatedStyle}>{children}</AnimatedContainer>
}

interface AnimatedCanvasProps extends CanvasDimensions {
  children: ReactNode
}

const AnimatedCanvas = ({ children, canvasHeight, canvasWidth }: AnimatedCanvasProps) => {
  const animatedCanvasStyle = useAnimatedStyle(() => ({
    height: canvasHeight.get(),
    width: canvasWidth.get()
  }))

  return (
    <Animated.View style={animatedCanvasStyle}>
      <SkiaCanvas style={{ flex: 1 }}>{children}</SkiaCanvas>
    </Animated.View>
  )
}

const AnimatedContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
`

const AlephiumLogoContainer = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`
