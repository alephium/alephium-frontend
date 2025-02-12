/*
This component is energy intensive and should be used consciously.
Prefer using the ScreenAnimatedBackground when using it on a screen.
*/

import { Blur, Canvas, Circle, Group, interpolateColors } from '@shopify/react-native-skia'
// 1) Import colord (and extend if needed)
import { colord } from 'colord'
import { useEffect, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SensorType,
  SharedValue,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

// If you need plugins (like `colord` plugins), you can import and `extend` them here
// import { extend } from 'colord'
// extend([/* plugins */])
import AlephiumLogo from '~/images/logos/AlephiumLogo'

export interface AnimatedBackgroundProps {
  height?: number
  width?: number
  scrollY?: SharedValue<number>
  isAnimated?: boolean
  isFullScreen?: boolean
  showAlephiumLogo?: boolean
  shade?: string
}

const GYRO_MULTIPLIER_X = 100
const GYRO_MULTIPLIER_Y = 100

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas)

function getCircleColors({ shade, isDark }: { shade?: string; isDark: boolean }) {
  if (!shade) {
    return isDark ? ['#ffb473', '#d485df', '#957dff'] : ['#ffbca8', '#d774ff', '#ffcb67']
  }

  const base = colord(shade)
  const color1 = base.rotate(-15).toHex()
  const color2 = base.rotate(15).toHex()
  const color3 = base.rotate(35).toHex()

  return [color1, color2, color3]
}

const AnimatedBackground = ({
  height = 400,
  width,
  scrollY,
  isAnimated,
  isFullScreen,
  showAlephiumLogo,
  shade
}: AnimatedBackgroundProps) => {
  const gyroscope = useAnimatedSensor(SensorType.ROTATION)
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const theme = useTheme()

  const previousShadeRef = useRef(shade)
  const shadeTransition = useSharedValue(1)

  const defaultCanvasHeight = isFullScreen ? screenHeight : height
  const defaultCanvasWidth = width || screenWidth

  const canvasHeight = useSharedValue(defaultCanvasHeight)
  const canvasWidth = useSharedValue(defaultCanvasWidth)

  useEffect(() => {
    if (shade !== previousShadeRef.current) {
      shadeTransition.value = 0
      shadeTransition.value = withTiming(1, { duration: 600 }, () => {
        previousShadeRef.current = shade
      })
    }
  }, [shade, shadeTransition])

  const oldShadeColors = getCircleColors({
    shade: previousShadeRef.current,
    isDark: theme.name === 'dark'
  })
  const newShadeColors = getCircleColors({
    shade,
    isDark: theme.name === 'dark'
  })

  const [oldColor1, oldColor2, oldColor3] = oldShadeColors
  const [newColor1, newColor2, newColor3] = newShadeColors

  const circleColor1 = useDerivedValue(() => interpolateColors(shadeTransition.value, [0, 1], [oldColor1, newColor1]))
  const circleColor2 = useDerivedValue(() => interpolateColors(shadeTransition.value, [0, 1], [oldColor2, newColor2]))
  const circleColor3 = useDerivedValue(() => interpolateColors(shadeTransition.value, [0, 1], [oldColor3, newColor3]))

  useEffect(() => {
    canvasHeight.value = withSpring(defaultCanvasHeight, {
      mass: 5,
      damping: 60
    })
    canvasWidth.value = withSpring(defaultCanvasWidth, {
      mass: 5,
      damping: 60
    })
  }, [canvasHeight, canvasWidth, defaultCanvasHeight, defaultCanvasWidth])

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    height: canvasHeight.value,
    width: canvasWidth.value
  }))

  const parallaxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY?.value || 0, [-200, 200], [-30, 30], Extrapolation.CLAMP)
      }
    ]
  }))

  // Circle animations
  const angle = useSharedValue(0)

  const sinRoll = useDerivedValue(() => Math.sin(gyroscope.sensor.value.roll))
  const sinPitch = useDerivedValue(() => Math.sin(gyroscope.sensor.value.pitch))

  useEffect(() => {
    if (isAnimated) {
      angle.value = withRepeat(
        withTiming(2 * Math.PI, {
          duration: 6000,
          easing: Easing.linear
        }),
        -1
      )
    }
  }, [angle, isAnimated])

  const canvasCenterY = useDerivedValue(() => canvasHeight.value / 2)

  const danceXAmplitude = 20 + Math.random() * 10
  const danceYAmplitude = 40 + Math.random() * 10

  const randomOffset1 = Math.random() * 0.7
  const randomOffset2 = Math.random() * 0.7
  const randomOffset3 = Math.random() * 0.7

  const circle1X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.value / 4 +
            danceXAmplitude * Math.cos(angle.value + randomOffset1) +
            sinRoll.value * GYRO_MULTIPLIER_X
        )
      : withSpring(100 + sinRoll.value * GYRO_MULTIPLIER_X, { mass: 10, damping: 10 })
  )

  const circle1Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + randomOffset1) +
            sinPitch.value * GYRO_MULTIPLIER_Y
        )
      : withSpring(canvasCenterY.value + sinPitch.value * GYRO_MULTIPLIER_Y, { mass: 10, damping: 10 })
  )

  const circle2X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.value / 2 +
            danceXAmplitude * Math.cos(angle.value + (2 * Math.PI) / 3 + randomOffset2) +
            sinRoll.value * GYRO_MULTIPLIER_X
        )
      : withSpring(screenWidth / 2 + sinRoll.value * GYRO_MULTIPLIER_X, { mass: 40, damping: 10 })
  )

  const circle2Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + (2 * Math.PI) / 3 + randomOffset2) +
            sinPitch.value * GYRO_MULTIPLIER_Y
        )
      : withSpring(canvasCenterY.value - 120 + sinPitch.value * GYRO_MULTIPLIER_Y, { mass: 10, damping: 10 })
  )

  const circle3X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          (3 * canvasWidth.value) / 4 +
            danceXAmplitude * Math.cos(angle.value + (4 * Math.PI) / 3 + randomOffset3) +
            sinRoll.value * GYRO_MULTIPLIER_X
        )
      : withSpring(screenWidth - 70 + sinRoll.value * GYRO_MULTIPLIER_X, { mass: 10, damping: 10 })
  )

  const circle3Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + (4 * Math.PI) / 3 + randomOffset3) +
            sinPitch.value * GYRO_MULTIPLIER_Y
        )
      : withSpring(canvasCenterY.value - 60 + sinPitch.value * GYRO_MULTIPLIER_Y, { mass: 10, damping: 10 })
  )

  return (
    <AnimatedContainer style={parallaxAnimatedStyle}>
      <AnimatedCanvas style={animatedCanvasStyle}>
        <Group>
          <Circle r={140} color={circleColor1} cx={circle1X} cy={circle1Y} blendMode="colorBurn" />
          <Circle r={170} color={circleColor2} cx={circle2X} cy={circle2Y} blendMode="colorBurn" />
          <Circle r={150} color={circleColor3} cx={circle3X} cy={circle3Y} blendMode="colorBurn" />
        </Group>
        <Blur blur={70} />
      </AnimatedCanvas>
      {showAlephiumLogo && (
        <AlephiumLogoContainer>
          <AlephiumLogo color="white" style={{ width: '15%' }} />
        </AlephiumLogoContainer>
      )}
    </AnimatedContainer>
  )
}

export default AnimatedBackground

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
