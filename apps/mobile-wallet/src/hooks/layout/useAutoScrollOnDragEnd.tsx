import { FlashList } from '@shopify/flash-list'
import { RefObject } from 'react'
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native'

import { scrollScreenTo } from '~/utils/layout'

type UseAutoScrollReturnedHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => void

type UseAutoScrollOnDragEnd = {
  (scrollViewRef?: RefObject<ScrollView | null>): UseAutoScrollReturnedHandler
  (flatListRef?: RefObject<FlatList<unknown> | null>): UseAutoScrollReturnedHandler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (flashListRef?: RefObject<FlashList<any> | null>): UseAutoScrollReturnedHandler
}

const useAutoScrollOnDragEnd: UseAutoScrollOnDragEnd = (viewRef) => {
  const scrollDragEndHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!viewRef?.current) return
    if (e.nativeEvent.velocity && Math.abs(e.nativeEvent.velocity.y) > 0.6) return

    const contentOffset = e.nativeEvent.contentOffset

    if (contentOffset.y < 60) {
      scrollScreenTo(0, viewRef, true)
    } else if (contentOffset.y < 80) {
      scrollScreenTo(50, viewRef, true)
    }
  }

  return scrollDragEndHandler
}

export default useAutoScrollOnDragEnd
