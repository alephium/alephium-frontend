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

import { StackHeaderProps } from '@react-navigation/stack'
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia'
import { colord } from 'colord'
import { ReactNode, RefObject, useState } from 'react'
import { LayoutChangeEvent, Platform, useWindowDimensions, View, ViewProps } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export type BaseHeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'> & {
  headerTitleRight?: () => ReactNode
}

export interface BaseHeaderProps extends ViewProps {
  options: BaseHeaderOptions
  headerRef?: RefObject<Animated.View>
  titleAlwaysVisible?: boolean
  goBack?: () => void
  scrollY?: SharedValue<number>
  scrollEffectOffset?: number
  CustomContent?: ReactNode
}

const isIos = Platform.OS === 'ios'

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle, headerTitleRight },
  headerRef,
  titleAlwaysVisible,
  scrollY,
  scrollEffectOffset = 0,
  CustomContent,
  ...props
}: BaseHeaderProps) => {
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  const [headerHeight, setHeaderHeight] = useState(80)

  const gradientHeight = headerHeight + 30
  const defaultScrollRange = [0 + scrollEffectOffset, 80 + scrollEffectOffset]
  const paddingTop = isIos ? insets.top : insets.top + 7

  const HeaderRight = (headerRight && headerRight({})) || <HeaderSidePlaceholder />
  const HeaderLeft = (headerLeft && headerLeft({})) || <HeaderSidePlaceholder />
  const headerTitleString = headerTitle && typeof headerTitle === 'string' ? headerTitle : undefined
  const HeaderTitleComponent =
    headerTitle && typeof headerTitle === 'function' ? headerTitle({ children: '' }) : undefined
  const HeaderTitleRight = headerTitleRight && headerTitleRight()

  const animatedOpacity = useDerivedValue(() => interpolate(scrollY?.value || 0, defaultScrollRange, [0, 1]))

  const centerContainerAnimatedStyle = useAnimatedStyle(() =>
    headerTitle && !titleAlwaysVisible
      ? {
          opacity: interpolate(
            scrollY?.value || 0,
            [30 + scrollEffectOffset, 50 + scrollEffectOffset],
            [0, 1],
            Extrapolation.CLAMP
          )
        }
      : {}
  )

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height)
  }

  return (
    <BaseHeaderStyled ref={headerRef} onLayout={handleHeaderLayout} {...props}>
      <View pointerEvents="none">
        <HeaderGradientCanvas height={gradientHeight} pointerEvents="none">
          <Rect x={0} y={0} width={screenWidth} height={gradientHeight} opacity={animatedOpacity}>
            <LinearGradient
              start={vec(0, gradientHeight / 1.5)}
              end={vec(0, gradientHeight)}
              colors={
                theme.name === 'dark'
                  ? [theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]
                  : [theme.bg.highlight, colord(theme.bg.highlight).alpha(0).toHex()]
              }
            />
          </Rect>
        </HeaderGradientCanvas>
      </View>
      <HeaderContainer>
        <Header style={{ paddingTop }}>
          {!CustomContent ? (
            <>
              {HeaderLeft}
              {(headerTitleString || HeaderTitleComponent) && (
                <CenterContainer style={centerContainerAnimatedStyle}>
                  {headerTitleString ? (
                    <AppText semiBold size={17}>
                      {headerTitleString}
                    </AppText>
                  ) : HeaderTitleComponent ? (
                    HeaderTitleComponent
                  ) : null}
                  {HeaderTitleRight}
                </CenterContainer>
              )}
              {HeaderRight}
            </>
          ) : (
            <CenterContainer>{CustomContent}</CenterContainer>
          )}
        </Header>
      </HeaderContainer>
    </BaseHeaderStyled>
  )
}

export default BaseHeader

const BaseHeaderStyled = styled(Animated.View)`
  width: 100%;
  z-index: 1;
`

const HeaderGradientCanvas = styled(Canvas)<{ height: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ height }) => height}px;
`

const HeaderContainer = styled(Animated.View)`
  flex-direction: column;
`

const CenterContainer = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: center;
  opacity: 1;
`

const Header = styled(Animated.View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${DEFAULT_MARGIN - 4}px 12px;
`

const HeaderSidePlaceholder = styled.View`
  width: 40px;
`
