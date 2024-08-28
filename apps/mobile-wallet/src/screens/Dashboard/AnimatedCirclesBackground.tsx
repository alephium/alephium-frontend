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

import { Canvas, Circle } from '@shopify/react-native-skia'
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
  scrollY?: SharedValue<number>
  isLoading?: boolean
}

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas)

const AnimatedCirclesBackground = ({ scrollY, isLoading }: AnimatedCirclesBackgroundProps) => {
  const gyroscope = useAnimatedSensor(SensorType.ROTATION)
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  // Canvas size animation
  const canvasHeight = useSharedValue(500)
  const canvasWidth = useSharedValue(500)

  useEffect(() => {
    canvasHeight.value = withSpring(isLoading ? screenHeight : 500)
    canvasWidth.value = withSpring(isLoading ? screenWidth : 500)
  }, [isLoading, screenWidth, canvasHeight, canvasWidth, screenHeight])

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
    if (isLoading) {
      angle.value = withRepeat(
        withTiming(2 * Math.PI, {
          duration: 4000,
          easing: Easing.linear
        }),
        -1
      )
    }
  }, [angle, isLoading])

  const circle1X = useDerivedValue(() =>
    isLoading
      ? screenWidth / 4 + 50 * Math.cos(angle.value)
      : withSpring(80 + gyroscope.sensor.value.roll * 25, { mass: 20, damping: 20 })
  )

  const circle1Y = useDerivedValue(() =>
    isLoading
      ? 210 + 50 * Math.sin(angle.value)
      : withSpring(210 + gyroscope.sensor.value.pitch * 25, { mass: 20, damping: 20 })
  )

  const circle2X = useDerivedValue(() =>
    isLoading
      ? screenWidth / 2 + 50 * Math.cos(angle.value + (2 * Math.PI) / 3)
      : withSpring(screenWidth / 2 + gyroscope.sensor.value.roll * 20, { mass: 40, damping: 20 })
  )

  const circle2Y = useDerivedValue(() =>
    isLoading
      ? 150 + 50 * Math.sin(angle.value + (2 * Math.PI) / 3)
      : withSpring(150 + gyroscope.sensor.value.pitch * 20, { mass: 40, damping: 20 })
  )

  const circle3X = useDerivedValue(() =>
    isLoading
      ? (3 * screenWidth) / 4 + 50 * Math.cos(angle.value + (4 * Math.PI) / 3)
      : withSpring(screenWidth - 50 + gyroscope.sensor.value.roll * 23, { mass: 30, damping: 20 })
  )

  const circle3Y = useDerivedValue(() =>
    isLoading
      ? 190 + 50 * Math.sin(angle.value + (4 * Math.PI) / 3)
      : withSpring(190 + gyroscope.sensor.value.pitch * 23, { mass: 30, damping: 20 })
  )

  return (
    <AnimatedContainer style={parallaxAnimatedStyle}>
      <AnimatedCanvas style={animatedCanvasStyle}>
        <Circle r={90} color="#FF2E21" cx={circle1X} cy={circle1Y} />
        <Circle r={82} color="#FFA621" cx={circle2X} cy={circle2Y} />
        <Circle r={80} color="#FB21FF" cx={circle3X} cy={circle3Y} />
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
