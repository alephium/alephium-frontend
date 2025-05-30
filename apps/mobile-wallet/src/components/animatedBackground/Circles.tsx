import { Circle, interpolateColors } from '@shopify/react-native-skia'
// 1) Import colord (and extend if needed)
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import {
  AnimatedSensor,
  Easing,
  runOnJS,
  SensorType,
  useAnimatedSensor,
  useDerivedValue,
  useSharedValue,
  ValueRotation,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated'

import { AnimatedBackgroundProps } from '~/components/animatedBackground/animatedBackgroundTypes'
import { CanvasDimensions } from '~/components/animatedBackground/useCanvasDimentions'

const GYRO_MULTIPLIER_X = 100
const GYRO_MULTIPLIER_Y = 100
const LIGHT_THEME_COLORS = ['#ffbca8', '#d774ff', '#ffcb67']
const DARK_THEME_COLORS = ['#ffb473', '#d485df', '#957dff']

interface CirclesBaseProps extends CanvasDimensions, Pick<AnimatedBackgroundProps, 'shade' | 'isAnimated'> {
  isDark: boolean
}

interface CirclesProps extends CirclesBaseProps {
  gyroscope?: AnimatedSensor<ValueRotation>
}

export const GyroscopeCircles = (props: CirclesBaseProps) => {
  const gyroscope = useAnimatedSensor(SensorType.ROTATION)

  return <Circles {...props} gyroscope={gyroscope} />
}

export const Circles = ({ shade, isAnimated, canvasHeight, canvasWidth, isDark, gyroscope }: CirclesProps) => {
  const { circleColor1, circleColor2, circleColor3 } = useCircleColors({ isDark, shade })
  const { width: screenWidth } = useWindowDimensions()

  const sinRoll = useDerivedValue(() => Math.sin(gyroscope?.sensor.get().roll || 0))
  const sinPitch = useDerivedValue(() => Math.sin(gyroscope?.sensor.get().pitch || 0))

  const canvasCenterY = useDerivedValue(() => canvasHeight.get() / 2)

  const danceXAmplitude = 20 + Math.random() * 10
  const danceYAmplitude = 40 + Math.random() * 10

  const randomOffset1 = Math.random() * 0.7
  const randomOffset2 = Math.random() * 0.7
  const randomOffset3 = Math.random() * 0.7

  const angle = useAnimatedAngle(isAnimated)

  const circle1X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.get() / 4 +
            danceXAmplitude * Math.cos(angle.get() + randomOffset1) +
            sinRoll.get() * GYRO_MULTIPLIER_X
        )
      : withSpring(100 + sinRoll.get() * GYRO_MULTIPLIER_X, { mass: 10, damping: 10 })
  )

  const circle1Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.get() +
            danceYAmplitude * Math.sin(angle.get() + randomOffset1) +
            sinPitch.get() * GYRO_MULTIPLIER_Y
        )
      : withSpring(canvasCenterY.get() + sinPitch.get() * GYRO_MULTIPLIER_Y, { mass: 10, damping: 10 })
  )

  const circle2X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.get() / 2 +
            danceXAmplitude * Math.cos(angle.get() + (2 * Math.PI) / 3 + randomOffset2) +
            sinRoll.get() * GYRO_MULTIPLIER_X
        )
      : withSpring(screenWidth / 2 + sinRoll.get() * GYRO_MULTIPLIER_X, { mass: 40, damping: 10 })
  )

  const circle2Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.get() +
            danceYAmplitude * Math.sin(angle.get() + (2 * Math.PI) / 3 + randomOffset2) +
            sinPitch.get() * GYRO_MULTIPLIER_Y
        )
      : withSpring(canvasCenterY.get() - 120 + sinPitch.get() * GYRO_MULTIPLIER_Y, { mass: 10, damping: 10 })
  )

  const circle3X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          (3 * canvasWidth.get()) / 4 +
            danceXAmplitude * Math.cos(angle.get() + (4 * Math.PI) / 3 + randomOffset3) +
            sinRoll.get() * GYRO_MULTIPLIER_X
        )
      : withSpring(screenWidth - 70 + sinRoll.get() * GYRO_MULTIPLIER_X, { mass: 10, damping: 10 })
  )

  const circle3Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.get() +
            danceYAmplitude * Math.sin(angle.get() + (4 * Math.PI) / 3 + randomOffset3) +
            sinPitch.get() * GYRO_MULTIPLIER_Y
        )
      : withSpring(canvasCenterY.get() - 60 + sinPitch.get() * GYRO_MULTIPLIER_Y, { mass: 10, damping: 10 })
  )

  return (
    <>
      <Circle r={140} color={circleColor1} cx={circle1X} cy={circle1Y} blendMode="colorBurn" />
      <Circle r={170} color={circleColor2} cx={circle2X} cy={circle2Y} blendMode="colorBurn" />
      <Circle r={150} color={circleColor3} cx={circle3X} cy={circle3Y} blendMode="colorBurn" />
    </>
  )
}

const useAnimatedAngle = (isAnimated?: AnimatedBackgroundProps['isAnimated']) => {
  const angle = useSharedValue(0)

  useEffect(() => {
    if (!isAnimated) return

    angle.set(
      withRepeat(
        withTiming(2 * Math.PI, {
          duration: 6000,
          easing: Easing.linear
        }),
        -1
      )
    )
  }, [angle, isAnimated])

  return angle
}

type CircleColorsProps = Pick<CirclesBaseProps, 'isDark' | 'shade'>

const useCircleColors = ({ isDark, shade }: CircleColorsProps) => {
  const [previousShade, setPreviousShade] = useState(shade)
  const shadeTransition = useSharedValue(1)

  useEffect(() => {
    if (shade !== previousShade) {
      shadeTransition.set(0)
      shadeTransition.set(
        withTiming(1, { duration: 600 }, (finished) => {
          if (finished) {
            runOnJS(setPreviousShade)(shade)
          }
        })
      )
    }
  }, [previousShade, shade, shadeTransition])

  const oldShadeColors = getCircleColors({
    shade: previousShade,
    isDark
  })
  const newShadeColors = getCircleColors({
    shade,
    isDark
  })

  const [oldColor1, oldColor2, oldColor3] = oldShadeColors
  const [newColor1, newColor2, newColor3] = newShadeColors

  const circleColor1 = useDerivedValue(() => interpolateColors(shadeTransition.get(), [0, 1], [oldColor1, newColor1]))
  const circleColor2 = useDerivedValue(() => interpolateColors(shadeTransition.get(), [0, 1], [oldColor2, newColor2]))
  const circleColor3 = useDerivedValue(() => interpolateColors(shadeTransition.get(), [0, 1], [oldColor3, newColor3]))

  return { circleColor1, circleColor2, circleColor3 }
}

const getCircleColors = ({ shade, isDark }: CircleColorsProps) => {
  if (!shade) {
    return isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS
  }

  const base = colord(shade)
  const color1 = base.rotate(-15).toHex()
  const color2 = base.rotate(15).toHex()
  const color3 = base.rotate(35).toHex()

  return [color1, color2, color3]
}
