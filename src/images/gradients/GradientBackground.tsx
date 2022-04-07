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
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { useTheme } from 'styled-components'

interface GradientBackgroundProps {
  style?: StyleProp<ViewStyle>
}

const GradientBackground = ({ style }: GradientBackgroundProps) => {
  const theme = useTheme()
  const { yellow, orange, red, purple, cyan } = theme.gradient

  return (
    <View style={style}>
      <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Path d="M0 0H390V844H0V0Z" fill="url(#gradient)" />
        <Defs>
          <LinearGradient id="gradient" gradientTransform="rotate(65)" gradientUnits="userSpaceOnUse">
            <Stop stopColor={yellow} />
            <Stop offset="0.240793" stopColor={orange} />
            <Stop offset="0.466882" stopColor={red} />
            <Stop offset="0.831742" stopColor={purple} />
            <Stop offset="1" stopColor={cyan} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  )
}

export default GradientBackground
