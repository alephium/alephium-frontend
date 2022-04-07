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

interface AlephiumLogoProps {
  style?: StyleProp<ViewStyle>
}

const AlephiumLogo = ({ style }: AlephiumLogoProps) => (
  <View style={style}>
    <Svg width="100%" height="100%" viewBox="0 0 65 120" fill="none" preserveAspectRatio="slice">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M21.4729 78.9898C21.4729 77.4761 20.356 76.4729 18.977 76.7532L2.49517 80.1039C1.11619 80.3843 0 81.8415 0 83.3552L0 116.757C0 118.274 1.11619 119.278 2.49517 118.997L18.977 115.647C20.356 115.366 21.4729 113.909 21.4729 112.392V78.9898Z"
        fill="white"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M64.4236 3.65992C64.4236 2.14621 63.3068 1.14295 61.9278 1.42329L45.4459 4.77399C44.0669 5.05433 42.9507 6.51156 42.9507 8.02527V41.4272C42.9507 42.9444 44.0669 43.9479 45.4459 43.6675L61.9278 40.3168C63.3068 40.0365 64.4236 38.579 64.4236 37.0619V3.65992Z"
        fill="white"
        fillOpacity="0.7"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M25.075 11.5183C24.4526 10.0091 22.7043 9.02931 21.1677 9.32749L2.80086 12.8913C1.26417 13.1895 0.523973 14.6521 1.14639 16.1614L39.3801 108.872C40.0025 110.381 41.7537 111.37 43.2904 111.072L61.6572 107.508C63.1939 107.21 63.9311 105.738 63.3087 104.229L25.075 11.5183Z"
        fill="white"
      />
    </Svg>
  </View>
)

export default AlephiumLogo
