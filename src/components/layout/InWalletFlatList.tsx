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

import { FlatList, FlatListProps, StyleProp, ViewStyle } from 'react-native'

import useScrollHandling from '../../hooks/layout/useScrollHandling'
import Screen from './Screen'

interface ScreenProps<T> extends FlatListProps<T> {
  onScrollYChange: (scrollY: number) => void
  style?: StyleProp<ViewStyle>
}

function InWalletFlatList<T>({ style, onScroll, onScrollEndDrag, onScrollYChange, ...props }: ScreenProps<T>) {
  const [handleScroll, handleScrollEndDrag] = useScrollHandling({
    onScroll,
    onScrollEndDrag,
    onScrollYChange
  })

  return (
    <Screen style={style}>
      <FlatList onScroll={handleScroll} onScrollEndDrag={handleScrollEndDrag} {...props} />
    </Screen>
  )
}

export default InWalletFlatList
