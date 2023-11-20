/*
Copyright 2018 - 2023 The Alephium Authors
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
import { FlatListProps } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useNavigationScrollHandler from '~/hooks/layout/useNavigationScrollHandler'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useScrollToTopOnBlur from '~/hooks/layout/useScrollToTopOnBlur'
import { VERTICAL_GAP } from '~/style/globalStyle'

export interface FlatListScreenProps<T> extends FlatListProps<T>, ScrollScreenBaseProps {}

const FlatListScreen = <T,>({
  headerOptions,
  fill,
  contentContainerStyle,
  style,
  contrastedBg,
  hasNavigationHeader,
  ...props
}: FlatListScreenProps<T>) => {
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const navigationScrollHandler = useNavigationScrollHandler(flatListRef)
  const scrollEndHandler = useAutoScrollOnDragEnd(flatListRef)

  useScrollToTopOnBlur(flatListRef)

  const { screenScrollY, screenScrollHandler, screenHeaderLayoutHandler } = useScreenScrollHandler()

  return (
    <Screen contrastedBg={contrastedBg}>
      {headerOptions && (
        <BaseHeader options={headerOptions} scrollY={screenScrollY} onLayout={screenHeaderLayoutHandler} />
      )}
      <FlatList
        ref={flatListRef}
        onScroll={hasNavigationHeader ? navigationScrollHandler : screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          {
            paddingBottom: insets.bottom,
            flex: fill ? 1 : undefined,
            gap: VERTICAL_GAP
          },
          contentContainerStyle
        ]}
        style={[style, { overflow: 'visible' }]}
        {...props}
      />
    </Screen>
  )
}

export default FlatListScreen
