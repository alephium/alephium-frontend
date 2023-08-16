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

import { useRef } from 'react'
import { FlatList, FlatListProps, StyleProp, ViewStyle } from 'react-native'

import Screen from './Screen'

interface ScreenProps<T> extends FlatListProps<T> {
  style?: StyleProp<ViewStyle>
}

const ScrollFlatListScreen = <T,>({ style, onScrollEndDrag, ...props }: ScreenProps<T>) => {
  const listRef = useRef<FlatList<T>>(null)

  return (
    <Screen style={style}>
      <FlatList scrollEventThrottle={16} ref={listRef} {...props} />
    </Screen>
  )
}

export default ScrollFlatListScreen
