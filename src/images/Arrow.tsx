/*
Copyright 2018 - 2022 The Alephium Authors
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

import { StyleProp, View, ViewStyle } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import styled, { css } from 'styled-components/native'

interface ArrowProps {
  style?: StyleProp<ViewStyle>
  color?: string
  direction?: 'up' | 'down'
}

const Arrow = ({ style, color = 'black', direction = 'up' }: ArrowProps) => (
  <View style={style}>
    <ArrowSvg width="20" height="21" viewBox="0 0 20 21" direction={direction}>
      <Path d="M10 4.66669V16.3334" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <Path
        d="M15.8333 10.5L9.99999 16.3333L4.16666 10.5"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </ArrowSvg>
  </View>
)

export default Arrow

const ArrowSvg = styled(Svg)<{ direction?: 'up' | 'down' }>`
  ${({ direction = 'down' }) =>
    direction === 'up' &&
    css`
      transform: rotate(180deg);
    `}
`
