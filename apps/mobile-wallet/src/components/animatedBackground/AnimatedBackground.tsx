import { Blur, Canvas, Fill, LinearGradient, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import { colord } from 'colord'
import { Group } from 'lucide-react-native'
import { memo, useEffect, useState } from 'react'
import { LayoutChangeEvent } from 'react-native'
import Animated, {
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { useIsScreenOrModalFocused } from '~/utils/navigation'

interface AnimatedBackgroundProps {
  offsetTop?: number
  shade?: string
}

const GYRO_MULTIPLIER = 100
const FPS_60 = 1000 / 60 // ~16.67ms for 60fps

const springConfig = {
  damping: 10,
  stiffness: 100
}

const AnimatedBackground = memo(({ offsetTop = 0, shade }: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const isFocused = useIsScreenOrModalFocused()
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const gyroscope = useAnimatedSensor(SensorType.ROTATION, {
    interval: isFocused ? FPS_60 : 1000000
  })
  const opacity = useSharedValue(1)
  const lastUpdate = useSharedValue(0)
  const lastRollValue = useSharedValue(0)
  const lastPitchValue = useSharedValue(0)

  useEffect(() => {
    opacity.value = withSpring(isFocused ? 1 : 0, springConfig)
  }, [isFocused, opacity])

  const linearGradientPositions = [0.1, 0.2, 0.6, 0.7, 0.75, 1]
  const radialGradientPositions = [0.4, 0.5, 0.6, 0.7, 0.75, 1]

  const getGradientColors = (opacity: number) => [
    colord(shade || theme.global.palette2)
      .alpha(opacity)
      .toHex(),
    colord(shade || theme.global.palette5)
      .alpha(opacity)
      .toHex(),
    colord(theme.global.palette4).alpha(opacity).toHex(),
    colord(theme.global.palette1).alpha(opacity).toHex(),
    colord(theme.global.palette3).alpha(opacity).toHex(),
    theme.bg.back2
  ]

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  const shouldUpdate = () => {
    'worklet'
    const now = Date.now()
    if (now - lastUpdate.value < FPS_60) {
      return false
    }
    lastUpdate.value = now
    return true
  }

  const sinRoll = useDerivedValue(() => {
    if (!shouldUpdate()) return lastRollValue.value

    const newValue = isFocused ? Math.sin(gyroscope?.sensor.get().roll || 0) : 0
    lastRollValue.value = newValue
    return newValue
  })

  const sinZ = useDerivedValue(() => {
    if (!shouldUpdate()) return lastPitchValue.value

    const newValue = isFocused ? Math.sin(gyroscope?.sensor.get().pitch || 0) : 0
    lastPitchValue.value = newValue
    return newValue
  })

  const radialGradientCenter = useDerivedValue(() => {
    if (!isFocused) {
      return vec(containerDimensions.width / 2, containerDimensions.height + 70)
    }
    const x = containerDimensions.width / 2 + sinRoll.value * GYRO_MULTIPLIER
    const y = containerDimensions.height + 70
    return vec(x, y)
  })

  const radialGradientRadius = useDerivedValue(() => {
    const baseRadius = containerDimensions.width * 0.5
    if (!isFocused) return baseRadius

    return withSpring(baseRadius * (1 - sinZ.value * 0.2))
  })

  const linearGradientEnd = useDerivedValue(() => {
    if (!isFocused) {
      return vec(containerDimensions.width, containerDimensions.height)
    }
    const x = containerDimensions.width + sinRoll.value * GYRO_MULTIPLIER
    const y = containerDimensions.height * (1 + sinZ.value * 0.2)
    return vec(x, y)
  })

  const animatedPlaceholderStyle = useAnimatedStyle(() => ({
    opacity: 1 - opacity.value
  }))

  const animatedGradientStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))

  return (
    <Container onLayout={handleLayout} style={{ top: offsetTop }}>
      <AnimatedPlaceholderBackground style={[{ backgroundColor: theme.bg.primary }, animatedPlaceholderStyle]} />
      <AnimatedGradientBackground style={animatedGradientStyle}>
        <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Group>
            <Fill color={theme.bg.primary} />
            <Rect x={0} y={0} width={containerDimensions.width} height={containerDimensions.height}>
              <LinearGradient
                colors={getGradientColors(1)}
                positions={linearGradientPositions}
                start={vec(0, 0)}
                end={linearGradientEnd}
              />
            </Rect>
            <Rect x={0} y={0} width={containerDimensions.width} height={containerDimensions.height} opacity={0.9}>
              <RadialGradient
                c={radialGradientCenter}
                r={radialGradientRadius}
                colors={getGradientColors(theme.name === 'light' ? 0.5 : 0.9)}
                positions={radialGradientPositions}
              />
            </Rect>
            <Blur blur={20} />
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
