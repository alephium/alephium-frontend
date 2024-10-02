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
  const danceXAmplitude = 20 + Math.random() * 5 // Adding randomness to amplitude
  const danceYAmplitude = 40 + Math.random() * 5 // Adding randomness to amplitude

  const randomOffset1 = Math.random() * 0.5 // Random offset for circle 1
  const randomOffset2 = Math.random() * 0.5 // Random offset for circle 2
  const randomOffset3 = Math.random() * 0.5 // Random offset for circle 3

  const circle1X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.value / 4 +
            danceXAmplitude * Math.cos(angle.value + randomOffset1) +
            gyroscope.sensor.value.roll * 50
        )
      : withSpring(100 + gyroscope.sensor.value.roll * 50, { mass: 10, damping: 10 })
  )

  const circle1Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + randomOffset1) +
            gyroscope.sensor.value.pitch * 50
        )
      : withSpring(canvasCenterY.value + gyroscope.sensor.value.pitch * 35, { mass: 10, damping: 10 })
  )

  const circle2X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.value / 2 +
            danceXAmplitude * Math.cos(angle.value + (2 * Math.PI) / 3 + randomOffset2) +
            gyroscope.sensor.value.roll * 40
        )
      : withSpring(screenWidth / 2 + gyroscope.sensor.value.roll * 40, { mass: 40, damping: 10 })
  )

  const circle2Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + (2 * Math.PI) / 3 + randomOffset2) +
            gyroscope.sensor.value.pitch * 60
        )
      : withSpring(canvasCenterY.value - 120 + gyroscope.sensor.value.pitch * 20, { mass: 10, damping: 10 })
  )

  const circle3X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          (3 * canvasWidth.value) / 4 +
            danceXAmplitude * Math.cos(angle.value + (4 * Math.PI) / 3 + randomOffset3) +
            gyroscope.sensor.value.roll * 42
        )
      : withSpring(screenWidth - 70 + gyroscope.sensor.value.roll * 42, { mass: 10, damping: 10 })
  )

  const circle3Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + (4 * Math.PI) / 3 + randomOffset3) +
            gyroscope.sensor.value.pitch * 42
        )
      : withSpring(canvasCenterY.value - 60 + gyroscope.sensor.value.pitch * 42, { mass: 10, damping: 10 })
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
