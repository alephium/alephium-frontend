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

import { Canvas, Circle, Group } from '@shopify/react-native-skia'
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

interface AnimatedCirclesBackgroundProps {
  height?: number
  scrollY?: SharedValue<number>
  isAnimated?: boolean
  isFullScreen?: boolean
}

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas)

// TODO: FIX JUMPING ISSUES LINKED TO THIS COMPONENT

const AnimatedCirclesBackground = ({
  height = 400,
  scrollY,
  isAnimated = false,
  isFullScreen = false
}: AnimatedCirclesBackgroundProps) => {
  const gyroscope = useAnimatedSensor(SensorType.ROTATION)
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  // Canvas size animation
  const canvasHeight = useSharedValue(isFullScreen ? screenHeight : height)
  const canvasWidth = useSharedValue(isFullScreen ? screenWidth : height)

  useEffect(() => {
    canvasHeight.value = withSpring(isFullScreen ? screenHeight : height, { mass: 20, damping: 60 })
    canvasWidth.value = withSpring(isFullScreen ? screenWidth : height, { mass: 20, damping: 60 })
  }, [isFullScreen, screenWidth, canvasHeight, canvasWidth, screenHeight, height])

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
            gyroscope.sensor.value.roll * 25
        )
      : withSpring(100 + gyroscope.sensor.value.roll * 25, { mass: 20, damping: 20 })
  )

  const circle1Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + randomOffset1) +
            gyroscope.sensor.value.pitch * 25
        )
      : withSpring(canvasCenterY.value + gyroscope.sensor.value.pitch * 25, { mass: 20, damping: 40 })
  )

  const circle2X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasWidth.value / 2 +
            danceXAmplitude * Math.cos(angle.value + (2 * Math.PI) / 3 + randomOffset2) +
            gyroscope.sensor.value.roll * 20
        )
      : withSpring(screenWidth / 2 + gyroscope.sensor.value.roll * 20, { mass: 40, damping: 20 })
  )

  const circle2Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + (2 * Math.PI) / 3 + randomOffset2) +
            gyroscope.sensor.value.pitch * 20
        )
      : withSpring(canvasCenterY.value - 60 + gyroscope.sensor.value.pitch * 20, { mass: 20, damping: 20 })
  )

  const circle3X = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          (3 * canvasWidth.value) / 4 +
            danceXAmplitude * Math.cos(angle.value + (4 * Math.PI) / 3 + randomOffset3) +
            gyroscope.sensor.value.roll * 23
        )
      : withSpring(screenWidth - 90 + gyroscope.sensor.value.roll * 23, { mass: 30, damping: 20 })
  )

  const circle3Y = useDerivedValue(() =>
    isAnimated
      ? withSpring(
          canvasCenterY.value +
            danceYAmplitude * Math.sin(angle.value + (4 * Math.PI) / 3 + randomOffset3) +
            gyroscope.sensor.value.pitch * 23
        )
      : withSpring(canvasCenterY.value - 20 + gyroscope.sensor.value.pitch * 23, { mass: 20, damping: 20 })
  )

  return (
    <AnimatedContainer style={parallaxAnimatedStyle}>
      <AnimatedCanvas style={animatedCanvasStyle}>
        <Group>
          <Circle r={96} color="#FF2E21" cx={circle1X} cy={circle1Y} />
          <Circle r={86} color="#FFA621" cx={circle2X} cy={circle2Y} />
          <Circle r={90} color="#FB21FF" cx={circle3X} cy={circle3Y} />
        </Group>
      </AnimatedCanvas>
    </AnimatedContainer>
  )
}

export default AnimatedCirclesBackground

const AnimatedContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
`
