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
import Animated, {
  Extrapolation,
  interpolate,
  SensorType,
  SharedValue,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring
} from 'react-native-reanimated'
import styled from 'styled-components/native'

interface AnimatedCirclesBackgroundProps {
  scrollY?: SharedValue<number>
}

const AnimatedCirclesBackground = ({ scrollY }: AnimatedCirclesBackgroundProps) => {
  const gyroscope = useAnimatedSensor(SensorType.ROTATION)

  const parallaxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY?.value || 0, [-200, 200], [-30, 30], Extrapolation.CLAMP) }]
  }))

  const circle1X = useDerivedValue(() => withSpring(110 + gyroscope.sensor.value.roll * 25, { mass: 20, damping: 20 }))
  const circle1Y = useDerivedValue(() => withSpring(230 + gyroscope.sensor.value.pitch * 25, { mass: 20, damping: 20 }))

  const circle2X = useDerivedValue(() => withSpring(80 + gyroscope.sensor.value.roll * 20, { mass: 40, damping: 20 }))
  const circle2Y = useDerivedValue(() => withSpring(130 + gyroscope.sensor.value.pitch * 20, { mass: 40, damping: 20 }))

  const circle3X = useDerivedValue(() => withSpring(310 + gyroscope.sensor.value.roll * 23, { mass: 30, damping: 20 }))
  const circle3Y = useDerivedValue(() => withSpring(120 + gyroscope.sensor.value.pitch * 23, { mass: 30, damping: 20 }))

  return (
    <AnimatedContainer style={parallaxAnimatedStyle}>
      <AnimatedBackgroundCanvas>
        <Circle r={90} color="#FFA621" cx={circle1X} cy={circle1Y} />
        <Circle r={96} color="#FF2E21" cx={circle2X} cy={circle2Y} />
        <Circle r={80} color="#FB21FF" cx={circle3X} cy={circle3Y} />
      </AnimatedBackgroundCanvas>
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

const AnimatedBackgroundCanvas = styled(Canvas)`
  height: 100%;
  width: 100%;
  height: 500px;
`
