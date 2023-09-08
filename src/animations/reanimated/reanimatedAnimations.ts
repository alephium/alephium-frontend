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

import { ViewStyle } from 'react-native'
import { StyleProp } from 'react-native'
import { EntryAnimationsValues, withSpring } from 'react-native-reanimated'
import { SpringConfig } from 'react-native-reanimated/lib/typescript/reanimated2/animation/springUtils'

export const defaultSpringConfiguration: SpringConfig = {
  stiffness: 100,
  damping: 50
}

export const fastSpringConfiguration: SpringConfig = {
  stiffness: 260,
  damping: 30,
  overshootClamping: true
}

export const PopIn = (targetValues: EntryAnimationsValues) => {
  'worklet'
  const animations: StyleProp<ViewStyle> = {
    transform: [{ scale: withSpring(1, fastSpringConfiguration) }]
  }
  const initialValues = {
    transform: [{ scale: 0 }]
  }

  return {
    initialValues,
    animations
  }
}

export const PopOut = (targetValues: EntryAnimationsValues) => {
  'worklet'
  const animations: StyleProp<ViewStyle> = {
    transform: [{ scale: withSpring(0, fastSpringConfiguration) }]
  }
  const initialValues = {
    transform: [{ scale: 1 }]
  }
  const callback = (finished: boolean) => {
    // optional callback that will fire when layout animation ends
  }
  return {
    initialValues,
    animations,
    callback
  }
}
