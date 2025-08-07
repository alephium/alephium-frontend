import { Blur, Canvas, Fill, LinearGradient, RadialGradient, Rect, RoundedRect, vec } from '@shopify/react-native-skia'
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

import { BORDER_RADIUS_BIG } from '~/style/globalStyle'
import { useIsScreenOrModalFocused } from '~/utils/navigation'

interface AnimatedBackgroundProps {
  offsetTop?: number
  shade?: string
}

const GYRO_MULTIPLIER = 70
const FPS_30 = 1000 / 30 // ~33.33ms for 30fps

const springConfig = {
  damping: 10,
  stiffness: 100
}

const AnimatedBackground = memo(({ offsetTop = 0, shade }: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const isFocused = useIsScreenOrModalFocused()
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const gyroscope = useAnimatedSensor(SensorType.ROTATION, {
    interval: isFocused ? FPS_30 : 1000000
  })
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withSpring(isFocused ? 1 : 0, springConfig)
  }, [isFocused, opacity])

  const radialGradientPositions = [0.5, 0.6, 0.7, 0.72, 0.75, 0.95, 1]

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

  const lastSensorUpdate = useSharedValue(0)
  const cachedSinRoll = useSharedValue(0)
  const cachedSinZ = useSharedValue(0)

  const shouldUpdateSensor = () => {
    'worklet'
    const now = Date.now()
    if (!isFocused || now - lastSensorUpdate.value < FPS_30) {
      return false
    }
    lastSensorUpdate.value = now
    return true
  }

  const sinRoll = useDerivedValue(() => {
    if (!shouldUpdateSensor()) return cachedSinRoll.value
    const newValue = Math.sin(gyroscope?.sensor.get().roll)
    cachedSinRoll.value = newValue
    return newValue
  })

  const sinZ = useDerivedValue(() => {
    if (!shouldUpdateSensor()) return cachedSinZ.value
    const newValue = Math.sin(gyroscope?.sensor.get().pitch)
    cachedSinZ.value = newValue
    return newValue
  })

  const gradientOffset = useSharedValue(0)

  const linearGradientPositions = useDerivedValue(() => {
    gradientOffset.value = sinRoll.value
    return [
      0,
      0,
      0.1 + gradientOffset.value,
      0.2 + gradientOffset.value,
      0.3 + gradientOffset.value,
      0.8 + gradientOffset.value,
      1.4 + gradientOffset.value
    ]
  })

  const radialGradientCenter = useDerivedValue(() => {
    const x = containerDimensions.width / 2 + sinRoll.value * GYRO_MULTIPLIER
    const y = containerDimensions.height + 80
    return vec(x, y)
  })

  const radialGradientRadius = useDerivedValue(() => {
    const maxRadius = 250
    const relativeRadius = containerDimensions.width * 0.45

    return relativeRadius > maxRadius ? maxRadius : relativeRadius
  })

  const linearGradientEndX = useSharedValue(0)
  const linearGradientEndY = useSharedValue(0)

  const linearGradientEnd = useDerivedValue(() => {
    linearGradientEndX.value = containerDimensions.width + sinRoll.value * GYRO_MULTIPLIER * 2
    linearGradientEndY.value = containerDimensions.height + sinZ.value * GYRO_MULTIPLIER * 2
    return vec(linearGradientEndX.value, linearGradientEndY.value)
  })

  const animatedGradientStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
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
              positions={linearGradientPositions}
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
                positions={radialGradientPositions}
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
