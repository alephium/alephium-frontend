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

import { useHeaderHeight } from '@react-navigation/elements'
import { useRef } from 'react'
import { FlatListProps } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components/native'

import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface FlatListScreenProps<T> extends FlatListProps<T>, ScrollScreenBaseProps {}

const FlatListScreen = <T,>({ hasHeader, fill, contentContainerStyle, style, ...props }: FlatListScreenProps<T>) => {
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const headerheight = useHeaderHeight()
  const scrollHandler = useScreenScrollHandler()
  const scrollEndHandler = useAutoScrollOnDragEnd(flatListRef)
  const theme = useTheme()

  useScrollToTopOnFocus(flatListRef)

  return (
    <FlatList
      ref={flatListRef}
      onScroll={scrollHandler}
      onScrollEndDrag={scrollEndHandler}
      contentContainerStyle={[
        {
          paddingTop: hasHeader ? headerheight + DEFAULT_MARGIN : 0,
          paddingBottom: insets.bottom,
          flex: fill ? 1 : undefined,
          gap: VERTICAL_GAP
        },
        contentContainerStyle
      ]}
      style={[
        {
          backgroundColor: theme.bg.back2
        },
        style
      ]}
      {...props}
    />
  )
}

export default FlatListScreen
