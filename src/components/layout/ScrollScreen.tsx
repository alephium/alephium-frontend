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
import { RefObject, useRef } from 'react'
import { ScrollView, ScrollViewProps, StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Screen from '~/components/layout/Screen'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface ScrollScreenBaseProps {
  hasHeader?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
  fill?: boolean
}

export interface ScrollScreenProps extends ScrollScreenBaseProps, ScrollViewProps {
  containerStyle?: StyleProp<ViewStyle>
  scrollViewRef?: RefObject<ScrollView>
  verticalGap?: number | boolean
}

const ScrollScreen = ({
  children,
  hasHeader,
  style,
  containerStyle,
  contentContainerStyle,
  verticalGap,
  fill,
  ...props
}: ScrollScreenProps) => {
  const viewRef = useRef<ScrollView>(null)

  const headerheight = useHeaderHeight()
  const scrollHandler = useScreenScrollHandler()
  const scrollEndHandler = useAutoScrollOnDragEnd(viewRef)
  const insets = useSafeAreaInsets()

  useScrollToTopOnFocus(viewRef)

  return (
    <Screen style={containerStyle}>
      <ScrollView
        ref={viewRef}
        scrollEventThrottle={16}
        alwaysBounceVertical={true}
        onScroll={scrollHandler}
        onScrollEndDrag={scrollEndHandler}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingTop: hasHeader ? headerheight + DEFAULT_MARGIN : 0,
            flex: fill ? 1 : undefined
          },
          contentContainerStyle
        ]}
        {...props}
      >
        <View
          style={[
            {
              gap: verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0,
              paddingBottom: insets.bottom + DEFAULT_MARGIN,
              flex: fill ? 1 : undefined
            },
            style
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </Screen>
  )
}

export default ScrollScreen
