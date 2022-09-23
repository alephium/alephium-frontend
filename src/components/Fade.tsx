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

import { ReactNode } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface FadeProps {
  visible: boolean
  modal?: boolean
  children: ReactNode
}

const Fade = ({ visible, modal, children }: FadeProps) => {
  const animatedStyles = useAnimatedStyle(() =>
    modal
      ? {
          opacity: withTiming(visible ? 1 : 0),
          position: 'absolute' as const,
          top: 0,
          width: '100%',
          height: '90%',
          left: 0,
          display: visible ? ('flex' as const) : ('none' as const),
          borderRadius: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }
      : {
          opacity: withTiming(visible ? 1 : 0)
        }
  )
  return (
    <Animated.View style={[{ flexGrow: 1 }, animatedStyles]}>
      <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </Animated.View>
  )
}

export default Fade
