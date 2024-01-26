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

import { useNavigation } from '@react-navigation/native'
import { ReactNode, RefObject, useRef } from 'react'
import { KeyboardAvoidingView, ScrollView, ScrollViewProps, StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import BaseHeader from '~/components/headers/BaseHeader'
import StackHeader from '~/components/headers/StackHeader'
import { ScreenProps } from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useScrollToTopOnBlur from '~/hooks/layout/useScrollToTopOnBlur'
import { DEFAULT_MARGIN, SCREEN_OVERFLOW, VERTICAL_GAP } from '~/style/globalStyle'

export interface ScrollScreenBaseProps extends ScreenProps {
  contentContainerStyle?: StyleProp<ViewStyle>
  fill?: boolean
  screenTitle?: string
  TitleSideComponent?: ReactNode
}

export interface ScrollScreenProps extends ScrollScreenBaseProps, ScrollViewProps {
  containerStyle?: StyleProp<ViewStyle>
  scrollViewRef?: RefObject<ScrollView>
  verticalGap?: number | boolean
  contentPaddingTop?: number | boolean
  usesKeyboard?: boolean
}

const ScrollScreen = ({
  children,
  style,
  containerStyle,
  contentContainerStyle,
  contentPaddingTop,
  verticalGap,
  contrastedBg,
  fill,
  headerOptions,
  usesKeyboard,
  screenTitle,
  TitleSideComponent,
  ...props
}: ScrollScreenProps) => {
  const viewRef = useRef<ScrollView>(null)
  const navigation = useNavigation()

  const scrollEndHandler = useAutoScrollOnDragEnd(viewRef)
  const insets = useSafeAreaInsets()

  useScrollToTopOnBlur(viewRef)

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  const HeaderComponent = headerOptions?.type === 'stack' ? StackHeader : BaseHeader

  const screen = (
    <ScrollViewContainer style={containerStyle}>
      {headerOptions && (
        <HeaderComponent
          goBack={navigation.canGoBack() ? navigation.goBack : undefined}
          options={{ headerTitle: screenTitle, ...headerOptions }}
          scrollY={screenScrollY}
        />
      )}
      <ScrollView
        ref={viewRef}
        scrollEventThrottle={16}
        alwaysBounceVertical={true}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        style={{ overflow: SCREEN_OVERFLOW, paddingTop: headerOptions ? 15 : 0 }}
        contentContainerStyle={[
          {
            flexGrow: fill ? 1 : undefined,
            paddingTop: typeof contentPaddingTop === 'boolean' ? 15 : contentPaddingTop
          },
          contentContainerStyle
        ]}
        {...props}
      >
        {screenTitle && (
          <ScreenTitle
            title={screenTitle}
            SideComponent={TitleSideComponent}
            scrollY={screenScrollY}
            sideDefaultMargin
          />
        )}
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
    </ScrollViewContainer>
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

const ScrollViewContainer = styled.View`
  flex: 1;
`
