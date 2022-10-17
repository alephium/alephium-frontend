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

import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import styled, { useTheme } from 'styled-components/native'

import { SvgProps } from '../../types/images'

const AlefSVG = ({ style, color }: SvgProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 17 11" preserveAspectRatio="slice">
        <Path
          fill={color ?? theme.font.primary}
          transform="translate(0,-47)"
          d="m 16.511787,48.196184 0,-4.895937 -2.783964,0 0,4.799938 c -0.03002,1.347329 -0.35401,2.468647 -0.971987,3.363957 -0.618007,0.895332 -1.349997,1.640655 -2.195972,2.235971 L 3.263958,43.300247 0,43.300247 4.735939,50.020161 c -1.2506557,0.842001 -2.301308,1.957985 -3.1519599,3.347957 -0.85065875,1.389989 -1.29331912,2.897968 -1.3279824,4.523941 l 0,4.607941 2.7839642,0 0,-4.511942 C 3.1299554,56.300753 3.5739495,54.955439 4.3719444,53.95211 5.1699269,52.948799 5.7819182,52.331474 6.2079201,52.100134 L 13.503826,62.5 l 3.263958,0 -4.735939,-6.719913 c 1.208636,-0.809982 2.247288,-1.885967 3.115959,-3.227959 0.868638,-1.341972 1.323299,-2.793952 1.363983,-4.355944 z"
        />
      </Svg>
    </View>
  )
}

export default styled(AlefSVG)`
  width: ${({ size }) => size ?? 11}px;
  height: ${({ size }) => size ?? 11}px;
`
