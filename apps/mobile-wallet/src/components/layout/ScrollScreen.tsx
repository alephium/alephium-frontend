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
import { useNavigation } from '@react-navigation/native'
import { RefObject, useRef } from 'react'
import { KeyboardAvoidingView, ScrollView, ScrollViewProps, StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BaseHeader from '@/components/headers/BaseHeader'
import StackHeader from '@/components/headers/StackHeader'
import Screen, { ScreenProps } from '@/components/layout/Screen'
import useAutoScrollOnDragEnd from '@/hooks/layout/useAutoScrollOnDragEnd'
import useNavigationScrollHandler from '@/hooks/layout/useNavigationScrollHandler'
import useScreenScrollHandler from '@/hooks/layout/useScreenScrollHandler'
import useScrollToTopOnBlur from '@/hooks/layout/useScrollToTopOnBlur'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '@/style/globalStyle'

export interface ScrollScreenBaseProps extends ScreenProps {
  contentContainerStyle?: StyleProp<ViewStyle>
  fill?: boolean
}

export interface ScrollScreenProps extends ScrollScreenBaseProps, ScrollViewProps {
  containerStyle?: StyleProp<ViewStyle>
  scrollViewRef?: RefObject<ScrollView>
  verticalGap?: number | boolean
  usesKeyboard?: boolean
}

const ScrollScreen = ({
  children,
  hasNavigationHeader,
  style,
  containerStyle,
  contentContainerStyle,
  verticalGap,
  contrastedBg,
  fill,
  headerOptions,
  usesKeyboard,
  ...props
}: ScrollScreenProps) => {
  const viewRef = useRef<ScrollView>(null)
  const navigation = useNavigation()

  const headerheight = useHeaderHeight()
  const navigationScrollHandler = useNavigationScrollHandler(viewRef)
  const scrollEndHandler = useAutoScrollOnDragEnd(viewRef)
  const insets = useSafeAreaInsets()

  useScrollToTopOnBlur(viewRef)

  const { screenScrollY, screenHeaderHeight, screenScrollHandler, screenHeaderLayoutHandler } = useScreenScrollHandler()

  const HeaderComponent = headerOptions?.type === 'stack' ? StackHeader : BaseHeader

  const screen = (
    <Screen style={containerStyle} contrastedBg={contrastedBg}>
      <ScrollView
        ref={viewRef}
        scrollEventThrottle={16}
        alwaysBounceVertical={true}
        onScroll={hasNavigationHeader ? navigationScrollHandler : screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingTop: headerOptions
              ? screenHeaderHeight + DEFAULT_MARGIN
              : hasNavigationHeader
              ? headerheight + DEFAULT_MARGIN
              : 0,
            flexGrow: fill ? 1 : undefined
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
      {headerOptions && (
        <HeaderComponent
          goBack={navigation.canGoBack() ? navigation.goBack : undefined}
          options={headerOptions}
          scrollY={screenScrollY}
          onLayout={screenHeaderLayoutHandler}
        />
      )}
    </Screen>
  )

  return usesKeyboard ? (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      {screen}
    </KeyboardAvoidingView>
  ) : (
    screen
  )
}

export default ScrollScreen
