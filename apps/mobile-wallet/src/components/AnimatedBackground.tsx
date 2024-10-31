/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Blur, Canvas, Circle, Group } from '@shopify/react-native-skia'
import { useEffect } from 'react'
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
import styled from 'styled-components/native'

import AlephiumLogo from '~/images/logos/AlephiumLogo'

interface AnimatedBackgroundProps {
  height?: number
  width?: number
  scrollY?: SharedValue<number>
  isAnimated?: boolean
  isFullScreen?: boolean
  showAlephiumLogo?: boolean
}

const GYRO_MULTIPLIER_X = 100
const GYRO_MULTIPLIER_Y = 100

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas)

const AnimatedBackground = ({
  height = 400,
  width = 400,
  scrollY,
  isAnimated,
  isFullScreen,
  showAlephiumLogo
}: AnimatedBackgroundProps) => {
  const gyroscope = useAnimatedSensor(SensorType.ROTATION)
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  // Canvas size animation
  const canvasHeight = useSharedValue(isFullScreen ? screenHeight : height)
  const canvasWidth = useSharedValue(isFullScreen ? screenWidth : width)

  useEffect(() => {
    canvasHeight.value = withSpring(isFullScreen ? screenHeight : height, { mass: 5, damping: 60 })
    canvasWidth.value = withSpring(isFullScreen ? screenWidth : width, { mass: 5, damping: 60 })
  }, [isFullScreen, screenWidth, canvasHeight, canvasWidth, screenHeight, height, width])

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    height: canvasHeight.value,
    width: canvasWidth.value
  }))

  const parallaxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY?.value || 0, [-200, 200], [-30, 30], Extrapolation.CLAMP) }]
  }))

  // Circle animations
  const angle = useSharedValue(0)

  // Using sin allows to smoothen movements (espacially when phon is upside down)
  const sinRoll = useDerivedValue(() => Math.sin(gyroscope.sensor.value.roll))
  const sinPitch = useDerivedValue(() => Math.sin(gyroscope.sensor.value.pitch))

  useEffect(() => {
    if (isAnimated) {
      angle.value = withRepeat(
        withTiming(2 * Math.PI, {
          duration: 4000,
          easing: Easing.linear
        }),
        -1
      )
    }
  }, [angle, isAnimated])

  const canvasCenterY = useDerivedValue(() => canvasHeight.value / 2)
  const danceXAmplitude = 20 + Math.random() * 5
  const danceYAmplitude = 40 + Math.random() * 5

  const randomOffset1 = Math.random() * 0.5
  const randomOffset2 = Math.random() * 0.5
  const randomOffset3 = Math.random() * 0.5

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

  // Repeat similar changes for circle2 and circle3
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
          <Circle r={140} color="#86acff" cx={circle1X} cy={circle1Y} />
          <Circle r={70} color="#2ac6ff" cx={circle2X} cy={circle2Y} />
          <Circle r={100} color="#1856ff" cx={circle3X} cy={circle3Y} />
        </Group>
        <Blur blur={50} />
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
