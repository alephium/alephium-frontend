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

import { StackHeaderProps } from '@react-navigation/stack'
import { BlurView } from 'expo-blur'
import { ReactNode, RefObject } from 'react'
import { Platform, Pressable, ViewProps } from 'react-native'
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { scrollScreenTo } from '~/utils/layout'

export type BaseHeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'> & {
  headerTitleRight?: () => ReactNode
}

export interface BaseHeaderProps extends ViewProps {
  options: BaseHeaderOptions
  TitleReplacementComponent?: ReactNode
  headerRef?: RefObject<Animated.View>
  showBorderBottom?: boolean
  goBack?: () => void
  scrollY?: SharedValue<number>
}

export const headerHeight = 90
export const scrollEndThreshold = 80
const defaultScrollRange = [0, scrollEndThreshold]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle, headerTitleRight },
  showBorderBottom,
  headerRef,
  scrollY,
  TitleReplacementComponent,
  ...props
}: BaseHeaderProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const isIos = Platform.OS === 'ios'
  const borderColorRange = [showBorderBottom ? theme.border.secondary : 'transparent', theme.border.secondary]

  const paddingTop = isIos ? insets.top : insets.top + 10

  const HeaderRight = headerRight && headerRight({})
  const HeaderLeft = headerLeft && headerLeft({})
  const HeaderTitle = headerTitle && (typeof headerTitle === 'string' ? headerTitle : headerTitle.arguments['children'])
  const HeaderTitleRight = headerTitleRight && headerTitleRight()

  const animatedBlurViewProps = useAnimatedProps(() =>
    isIos
      ? {
          intensity: interpolate(scrollY?.value || 0, defaultScrollRange, [0, 80], Extrapolate.CLAMP)
        }
      : {}
  )

  const bottomBorderAnimatedStyle = useAnimatedStyle(() =>
    showBorderBottom
      ? {
          opacity: interpolate(scrollY?.value || 0, [0, 20], [0, 1], Extrapolate.CLAMP),
          backgroundColor: interpolateColor(scrollY?.value || 0, defaultScrollRange, borderColorRange)
        }
      : {}
  )

  const titleContainerAnimatedStyle = useAnimatedStyle(() =>
    headerTitle
      ? {
          opacity: interpolate(scrollY?.value || 0, [40, 60], [0, 1], Extrapolate.CLAMP)
        }
      : {}
  )

  const handleCompactHeaderPress = () => {
    console.log('TODO: Reimplement scroll to top')

    /*
    if (activeScreenRef?.current) {
      scrollScreenTo(0, activeScreenRef, true)
    }
    */
  }

  return (
    <BaseHeaderStyled ref={headerRef} {...props}>
      <Pressable onPress={handleCompactHeaderPress}>
        <HeaderContainer>
          <ActionAreaBlurred style={{ paddingTop }} tint={theme.name} animatedProps={animatedBlurViewProps}>
            {HeaderLeft}
            {!TitleReplacementComponent ? (
              headerTitle && (
                <TitleContainer style={titleContainerAnimatedStyle}>
                  <AppText semiBold size={17}>
                    {HeaderTitle}
                  </AppText>
                </TitleContainer>
              )
            ) : (
              <TitleContainer style={titleContainerAnimatedStyle}>{TitleReplacementComponent}</TitleContainer>
            )}
            {HeaderRight}
          </ActionAreaBlurred>

          {showBorderBottom && <BottomBorder style={bottomBorderAnimatedStyle} />}
        </HeaderContainer>
      </Pressable>
    </BaseHeaderStyled>
  )
}

export default BaseHeader

const BaseHeaderStyled = styled(Animated.View)`
  width: 100%;
  z-index: 1;
`

const HeaderContainer = styled(Animated.View)`
  flex-direction: column;
`

const TitleContainer = styled(Animated.View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  opacity: 0;
`

const ActionAreaBlurred = styled(AnimatedBlurView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px ${DEFAULT_MARGIN}px;
  height: ${headerHeight}px;
`

const BottomBorder = styled(Animated.View)`
  position: absolute;
  bottom: -1px;
  right: 0;
  left: 0;
  height: 1px;
`
