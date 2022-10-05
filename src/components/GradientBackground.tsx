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

import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

interface GradientBackgroundProps {
  style?: StyleProp<ViewStyle>
}

const GradientBackground = ({ style }: GradientBackgroundProps) => {
  const theme = useTheme()
  const { yellow, orange, red, purple, cyan } = theme.gradient

  return (
    <MotiView
      style={style}
      from={{ scale: 1 }}
      animate={{ scale: 2 }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 2000
      }}
    >
      <LinearGradient colors={[yellow, orange, red, purple, cyan]} style={{ width: '100%', height: '100%' }} />
    </MotiView>
  )
}

export default styled(GradientBackground)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
`
