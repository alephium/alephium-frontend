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
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export type BaseHeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'> & {
  headerTitleRight?: () => ReactNode
}

export interface BaseHeaderProps extends ViewProps {
  options: BaseHeaderOptions
  headerRef?: RefObject<Animated.View>
  showBorderBottom?: boolean
  titleAlwaysVisible?: boolean
  goBack?: () => void
  scrollY?: SharedValue<number>
  CustomContent?: ReactNode
}

export const scrollEndThreshold = 80
const defaultScrollRange = [0, scrollEndThreshold]

const isIos = Platform.OS === 'ios'

const AnimatedHeader = isIos ? Animated.createAnimatedComponent(BlurView) : Animated.View

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle, headerTitleRight },
  showBorderBottom,
  headerRef,
  titleAlwaysVisible,
  scrollY,
  CustomContent,
  ...props
}: BaseHeaderProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const borderColorRange = [showBorderBottom ? theme.border.secondary : 'transparent', theme.border.secondary]
  const backgroundColorRange = [theme.header.hidden, theme.header.visible]

  const paddingTop = isIos ? insets.top : insets.top + 7

  const HeaderRight = (headerRight && headerRight({})) || <HeaderSidePlaceholder />
  const HeaderLeft = (headerLeft && headerLeft({})) || <HeaderSidePlaceholder />
  const HeaderTitle = headerTitle && (typeof headerTitle === 'string' ? headerTitle : headerTitle.arguments['children'])
  const HeaderTitleRight = headerTitleRight && headerTitleRight()

  const animatedHeaderProps = useAnimatedProps(() =>
    isIos
      ? {
          intensity: interpolate(scrollY?.value || 0, defaultScrollRange, [0, 80], Extrapolate.CLAMP)
        }
      : {}
  )

  const animatedHeaderStyle = useAnimatedStyle(() =>
    isIos
      ? {}
      : {
          backgroundColor: interpolateColor(scrollY?.value || 0, defaultScrollRange, backgroundColorRange)
        }
  )

  const bottomBorderAnimatedStyle = useAnimatedStyle(() =>
    showBorderBottom
      ? {
          opacity: interpolate(scrollY?.value || 0, [0, 20], [0, 1], Extrapolate.CLAMP),
          backgroundColor: interpolateColor(scrollY?.value || 0, defaultScrollRange, borderColorRange)
        }
      : {}
  )

  const centerContainerAnimatedStyle = useAnimatedStyle(() =>
    headerTitle && !titleAlwaysVisible
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
          <Header style={[{ paddingTop }, animatedHeaderStyle]} tint={theme.name} animatedProps={animatedHeaderProps}>
            {!CustomContent ? (
              <>
                {HeaderLeft}
                {headerTitle && (
                  <CenterContainer style={centerContainerAnimatedStyle}>
                    <AppText semiBold size={17}>
                      {HeaderTitle}
                    </AppText>
                    {HeaderTitleRight}
                  </CenterContainer>
                )}
                {HeaderRight}
              </>
            ) : (
              <CenterContainer>{CustomContent}</CenterContainer>
            )}
          </Header>

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

const CenterContainer = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: center;
  opacity: 1;
`

const Header = styled(AnimatedHeader)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${DEFAULT_MARGIN}px 12px;
`

const BottomBorder = styled(Animated.View)`
  position: absolute;
  bottom: -1px;
  right: 0;
  left: 0;
  height: 1px;
`

const HeaderSidePlaceholder = styled.View`
  width: 40px;
`
