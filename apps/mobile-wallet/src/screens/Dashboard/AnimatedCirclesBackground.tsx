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
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import styled from 'styled-components/native'

interface AnimatedCirclesBackgroundProps {
  scrollY?: SharedValue<number>
}

const AnimatedCirclesBackground = ({ scrollY }: AnimatedCirclesBackgroundProps) => {
  const parallaxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY?.value || 0, [-200, 200], [-30, 30], Extrapolation.CLAMP) }]
  }))

  return (
    <AnimatedContainer style={parallaxAnimatedStyle}>
      <AnimatedBackgroundCanvas>
        <Circle r={78} cx={30} cy={120} color="#FFA621" />
        <Circle r={96} cx={300} cy={220} color="#FF2E21" />
        <Circle r={80} cx={300} cy={90} color="#FB21FF" />
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
