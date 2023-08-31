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
import { RefObject } from 'react'
import { ScrollView, ScrollViewProps, StyleProp, View, ViewStyle } from 'react-native'

import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import { HORIZONTAL_MARGIN } from '~/style/globalStyle'

import Screen from './Screen'

export interface ScrollScreenProps extends ScrollViewProps {
  hasHeader?: boolean
  containerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  scrollViewRef?: RefObject<ScrollView>
}

const ScrollScreen = ({
  children,
  hasHeader,
  style,
  containerStyle,
  contentContainerStyle,
  scrollViewRef,
  ...props
}: ScrollScreenProps) => {
  const headerheight = useHeaderHeight()
  const scrollEndHandler = useAutoScrollOnDragEnd(scrollViewRef)

  return (
    <Screen style={containerStyle}>
      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        alwaysBounceVertical={false}
        onScrollEndDrag={scrollEndHandler}
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingTop: hasHeader ? headerheight + HORIZONTAL_MARGIN : 0
          }
        ]}
        {...props}
      >
        <View style={style}>{children}</View>
      </ScrollView>
    </Screen>
  )
}

export default ScrollScreen
