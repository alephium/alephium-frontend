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
import { AnimatedStyle, EntryAnimationsValues, withDelay, withTiming } from 'react-native-reanimated'

const SlideFromTop = (values: EntryAnimationsValues) => {
  'worklet'
  const animations: AnimatedStyle<ViewStyle> = {
    transform: [
      {
        translateY: withDelay(4000, withTiming(0, { duration: 2000 }))
      }
    ],
    opacity: withDelay(4000, withTiming(1, { duration: 2000 }))
  }
  const initialValues = {
    transform: [
      {
        translateY: -50
      }
    ],
    opacity: 0
  }
  return {
    initialValues,
    animations
  }
}

export default SlideFromTop
