/*
Copyright 2018 - 2024 The Alephium Authors
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
import ScreenTitle from '~/components/layout/ScreenTitle'
import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { SCREEN_OVERFLOW, VERTICAL_GAP } from '~/style/globalStyle'

export interface FlatListScreenProps<T> extends FlatListProps<T>, ScrollScreenBaseProps {}

const FlatListScreen = <T,>({
  headerOptions,
  fill,
  contentContainerStyle,
  style,
  contrastedBg,
  screenTitle,
  ...props
}: FlatListScreenProps<T>) => {
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const scrollEndHandler = useAutoScrollOnDragEnd(flatListRef)

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  return (
    <Screen contrastedBg={contrastedBg}>
      {headerOptions && <BaseHeader options={headerOptions} scrollY={screenScrollY} />}
      <FlatList
        ref={flatListRef}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={() =>
          screenTitle && <ScreenTitle title={screenTitle} scrollY={screenScrollY} sideDefaultMargin />
        }
        contentContainerStyle={[
          {
            paddingBottom: insets.bottom,
            flex: fill ? 1 : undefined,
            gap: VERTICAL_GAP
          },
          contentContainerStyle
        ]}
        style={[{ overflow: SCREEN_OVERFLOW }, style]}
        {...props}
      />
    </Screen>
  )
}

export default FlatListScreen
