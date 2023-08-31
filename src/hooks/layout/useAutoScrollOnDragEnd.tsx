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
import { RefObject } from 'react'
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native'

import { scrollEndThreshold } from '~/components/headers/BaseHeader'

type UseAutoScrollReturnedHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => void

type UseAutoScrollOnDragEnd = {
  (scrollViewRef?: RefObject<ScrollView>): UseAutoScrollReturnedHandler
  (flatListRef?: RefObject<FlatList>): UseAutoScrollReturnedHandler
}

const checkIfScrollView = (view: ScrollView | FlatList): view is ScrollView => 'scrollTo' in view

const useAutoScrollOnDragEnd: UseAutoScrollOnDragEnd = (viewRef) => {
  const scrollDragEndHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!viewRef?.current) return
    if (e.nativeEvent.velocity && Math.abs(e.nativeEvent.velocity.y) > 0.6) return

    const isScrollView = checkIfScrollView(viewRef.current)

    const contentOffset = e.nativeEvent.contentOffset

    if (isScrollView) {
      if (contentOffset.y < 60) {
        viewRef.current.scrollTo({ y: 0 })
      } else if (contentOffset.y < scrollEndThreshold) {
        viewRef.current.scrollTo({ y: scrollEndThreshold })
      }
    } else {
      if (contentOffset.y < 60) {
        viewRef.current.scrollToOffset({ offset: 0 })
      } else if (contentOffset.y < scrollEndThreshold) {
        viewRef.current.scrollToOffset({ offset: scrollEndThreshold })
      }
    }
  }

  return scrollDragEndHandler
}

export default useAutoScrollOnDragEnd
