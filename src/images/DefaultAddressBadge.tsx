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

import { Canvas, FitBox, Path, rect } from '@shopify/react-native-skia'
import { StyleProp, View, ViewStyle } from 'react-native'

interface DefaultAddressBadgeProps {
  style?: StyleProp<ViewStyle>
  color?: string
  size?: number
}

const DefaultAddressBadge = ({ style, size = 24, color = 'black' }: DefaultAddressBadgeProps) => (
  <Canvas style={[style, { width: size, height: size }]}>
    <FitBox src={rect(0, 0, 24, 24)} dst={rect(0, 0, size, size)}>
      <Path
        color={color}
        path="M24,12c0,-1.674 -1.03,-3.126 -2.564,-3.91c0.539,-1.628 0.234,-3.395 -0.948,-4.578c-1.183,-1.182 -2.95,-1.487 -4.578,-0.948c-0.772,-1.534 -2.236,-2.564 -3.91,-2.564c-1.674,0 -3.126,1.03 -3.899,2.564c-1.639,-0.539 -3.406,-0.234 -4.589,0.948c-1.182,1.183 -1.475,2.95 -0.936,4.578c-1.534,0.784 -2.576,2.236 -2.576,3.91c0,1.674 1.042,3.126 2.576,3.91c-0.539,1.628 -0.246,3.395 0.936,4.578c1.183,1.182 2.95,1.475 4.578,0.948c0.784,1.534 2.236,2.564 3.91,2.564c1.674,0 3.138,-1.03 3.91,-2.564c1.628,0.527 3.395,0.234 4.578,-0.948c1.182,-1.183 1.487,-2.95 0.948,-4.578c1.534,-0.784 2.564,-2.236 2.564,-3.91Zm-13.709,4.917l-4.379,-4.378l1.651,-1.663l2.646,2.646l5.619,-6.123l1.721,1.592l-7.258,7.926Z"
      />
    </FitBox>
  </Canvas>
)

export default DefaultAddressBadge
