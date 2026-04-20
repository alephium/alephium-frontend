import { Blur, Canvas, Fill, LinearGradient, RadialGradient, Rect, RoundedRect, vec } from '@shopify/react-native-skia'
import { colord } from 'colord'
import { Group } from 'lucide-react-native'
import { memo, useEffect, useMemo, useState } from 'react'
import { LayoutChangeEvent } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { runOnUI } from 'react-native-worklets'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS_BIG } from '~/style/globalStyle'
import { useIsScreenOrModalFocused } from '~/utils/navigation'

interface AnimatedBackgroundProps {
  offsetTop?: number
  shade?: string
}

const BREATH_HALF_MS = 4000
const BREATH_SCALE_MIN = 1
const BREATH_SCALE_MAX = 1.8
const BREATH_TRANSLATE_Y = 10

const RADIAL_GRADIENT_POSITIONS = [0.5, 0.6, 0.7, 0.72, 0.75, 0.95, 1]
const LINEAR_GRADIENT_POSITIONS = [0, 0, 0.1, 0.2, 0.3, 0.8, 1.4]
const RADIAL_GRADIENT_MAX_RADIUS = 250
const RADIAL_GRADIENT_RELATIVE_RADIUS = 0.45

const springConfig = {
  damping: 20,
  stiffness: 100
}

const breathEasing = Easing.inOut(Easing.sin)

const AnimatedBackground = memo(({ offsetTop = 0, shade }: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const isFocused = useIsScreenOrModalFocused()
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const opacity = useSharedValue(1)
  const breath = useSharedValue(0)

  useEffect(() => {
    opacity.value = withSpring(isFocused ? 1 : 0, springConfig)

    if (!isFocused) {
      cancelAnimation(breath)
      return
    }

    runOnUI(() => {
      'worklet'
      cancelAnimation(breath)
      breath.value = 0
      breath.value = withRepeat(withTiming(1, { duration: BREATH_HALF_MS, easing: breathEasing }), -1, true)
    })()

    return () => {
      cancelAnimation(breath)
    }
  }, [isFocused, opacity, breath])

  const getGradientColors = () => [
    colord('rgb(255, 255, 255)').toHex(),
    shade ? colord(shade).rotate(30).saturate(1.2).toHex() : colord(theme.global.palette2).toHex(),
    shade ? colord(shade).rotate(-30).saturate(1.2).toHex() : colord(theme.global.palette5).toHex(),
    colord(theme.global.palette4).toHex(),
    colord(theme.global.palette4).toHex(),
    colord(theme.global.palette3).toHex(),
    colord(shade || theme.global.accent)
      .alpha(0)
      .toHex()
  ]

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  const radialGradientCenter = useMemo(
    () => vec(containerDimensions.width / 2, containerDimensions.height + 80),
    [containerDimensions.width, containerDimensions.height]
  )

  const radialGradientRadius = useMemo(() => {
    const relative = containerDimensions.width * RADIAL_GRADIENT_RELATIVE_RADIUS
    return relative > RADIAL_GRADIENT_MAX_RADIUS ? RADIAL_GRADIENT_MAX_RADIUS : relative
  }, [containerDimensions.width])

  const linearGradientEnd = useMemo(
    () => vec(containerDimensions.width, containerDimensions.height),
    [containerDimensions.width, containerDimensions.height]
  )

  const animatedGradientStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: interpolate(breath.value, [0, 1], [0, BREATH_TRANSLATE_Y]) },
      { scale: interpolate(breath.value, [0, 1], [BREATH_SCALE_MIN, BREATH_SCALE_MAX]) }
    ]
  }))

  return (
    <Container onLayout={handleLayout} style={{ top: offsetTop }}>
      <AnimatedPlaceholderBackground style={[{ backgroundColor: theme.bg.primary }]} />
      <AnimatedGradientBackground style={animatedGradientStyle}>
        <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Fill color={theme.bg.primary} />
          <Rect
            x={0}
            y={0}
            width={containerDimensions.width}
            height={containerDimensions.height}
            opacity={theme.name === 'light' ? 0.8 : 0.4}
          >
            <LinearGradient
              colors={getGradientColors()}
              positions={LINEAR_GRADIENT_POSITIONS}
              start={vec(0, 0)}
              end={linearGradientEnd}
            />
          </Rect>
          <Group>
            <RoundedRect
              color={theme.bg.back1}
              x={0}
              y={0}
              r={BORDER_RADIUS_BIG}
              width={containerDimensions.width}
              height={containerDimensions.height}
              opacity={theme.name === 'light' ? 0.9 : 1}
            />
            <Blur blur={40} />
          </Group>
          <Group>
            <Rect
              x={0}
              y={0}
              width={containerDimensions.width}
              height={containerDimensions.height}
              opacity={theme.name === 'light' ? 0.65 : 0.9}
            >
              <RadialGradient
                c={radialGradientCenter}
                r={radialGradientRadius}
                colors={getGradientColors()}
                positions={RADIAL_GRADIENT_POSITIONS}
              />
            </Rect>
            <Blur blur={containerDimensions.width * (theme.name === 'light' ? 0.04 : 0.07)} />
          </Group>
        </Canvas>
      </AnimatedGradientBackground>
    </Container>
  )
})

export default AnimatedBackground

const Container = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

const SimpleBackground = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

const GradientBackground = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

const AnimatedPlaceholderBackground = Animated.createAnimatedComponent(SimpleBackground)
const AnimatedGradientBackground = Animated.createAnimatedComponent(GradientBackground)
