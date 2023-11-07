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
import { useNavigationScrollContext } from '~/contexts/NavigationScrollContext'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { scrollScreenTo } from '~/utils/layout'

export type HeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'> & {
  headerTitleRight?: () => ReactNode
  type?: 'default' | 'stack'
}

export interface BaseHeaderProps extends ViewProps {
  headerBottom?: () => ReactNode
  headerRef?: RefObject<Animated.View>
  options: HeaderOptions
  showCompactComponents?: boolean
  showBorderBottom?: boolean
  goBack?: () => void
  scrollY?: SharedValue<number>
}

export const scrollEndThreshold = 80

const defaultScrollRange = [0, scrollEndThreshold]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle, headerTitleRight },
  headerBottom,
  showCompactComponents,
  showBorderBottom,
  headerRef,
  scrollY,
  ...props
}: BaseHeaderProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { activeScreenRef } = useNavigationScrollContext()

  const isIos = Platform.OS === 'ios'
  const borderColorRange = [showBorderBottom ? theme.border.secondary : 'transparent', theme.border.secondary]

  const hasCompactHeader = showCompactComponents !== undefined || headerTitle
  const paddingTop = isIos ? insets.top : insets.top + 10

  const HeaderRight = headerRight && headerRight({})
  const HeaderLeft = headerLeft && headerLeft({})
  const HeaderBottom = headerBottom && headerBottom()
  const HeaderTitle = headerTitle && (typeof headerTitle === 'string' ? headerTitle : headerTitle.arguments['children'])
  const HeaderTitleRight = headerTitleRight && headerTitleRight()

  const titleAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader || headerTitle
      ? {
          transform: isIos
            ? [
                { translateY: interpolate(scrollY?.value || 0, [0, 70], [0, -50], Extrapolate.CLAMP) },
                { translateX: interpolate(scrollY?.value || 0, [0, -100], [0, 3], Extrapolate.CLAMP) },
                { scale: interpolate(scrollY?.value || 0, [0, -100], [1, 1.05], Extrapolate.CLAMP) }
              ]
            : undefined,
          opacity: interpolate(scrollY?.value || 0, [0, 40], [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const bottomContentAnimatedStyle = useAnimatedStyle(() =>
    HeaderBottomContent !== undefined
      ? {
          transform: [{ translateY: interpolate(scrollY?.value || 0, [0, 70], [0, -50], Extrapolate.CLAMP) }],
          opacity: interpolate(scrollY?.value || 0, defaultScrollRange, [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const animatedBlurViewProps = useAnimatedProps(() =>
    isIos
      ? {
          intensity: interpolate(scrollY?.value || 0, defaultScrollRange, [0, 80], Extrapolate.CLAMP)
        }
      : {}
  )

  const bottomBorderColor = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY?.value || 0, defaultScrollRange, borderColorRange)
  }))

  const bottomBorderPosition = useAnimatedStyle(() =>
    showBorderBottom
      ? {
          transform: isIos
            ? [{ translateY: interpolate(scrollY?.value || 0, [0, 70], [0, -50], Extrapolate.CLAMP) }]
            : undefined,
          opacity: isIos ? undefined : interpolate(scrollY?.value || 0, [0, 20], [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const expandedContentAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader
      ? {
          transform: isIos
            ? [{ translateY: interpolate(scrollY?.value || 0, [20, scrollEndThreshold], [0, -15], Extrapolate.CLAMP) }]
            : undefined,
          opacity: interpolate(scrollY?.value || 0, [20, scrollEndThreshold], [1, 0], Extrapolate.CLAMP),
          zIndex: (scrollY?.value || 0) > scrollEndThreshold - 10 ? -1 : 0
        }
      : {}
  )

  const compactContentAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader
      ? {
          opacity: interpolate(scrollY?.value || 0, [isIos ? 60 : 40, scrollEndThreshold], [0, 1], Extrapolate.CLAMP),
          height: isIos ? interpolate(scrollY?.value || 0, [60, scrollEndThreshold], [110, 95], Extrapolate.CLAMP) : 95
        }
      : {}
  )

  const handleCompactHeaderPress = () => {
    if (activeScreenRef?.current) {
      scrollScreenTo(0, activeScreenRef, true)
    }
  }

  const compactHeaderContents = (
    <>
      {(showCompactComponents && (
        <CompactContent>
          {headerBottom ? (
            <ScaledDownHeaderComponent>{HeaderBottom}</ScaledDownHeaderComponent>
          ) : (
            <>
              <ScaledDownHeaderComponentLeft>{HeaderLeft}</ScaledDownHeaderComponentLeft>
              <CompactHeaderTitle>
                <CompactTitle>{HeaderTitle}</CompactTitle>
                {HeaderTitleRight}
              </CompactHeaderTitle>
              <ScaledDownHeaderComponentRight>{HeaderRight}</ScaledDownHeaderComponentRight>
            </>
          )}
        </CompactContent>
      )) || (
        <CompactHeaderTitle>
          <CompactTitle>{HeaderTitle}</CompactTitle>
        </CompactHeaderTitle>
      )}
      <BottomBorder style={bottomBorderColor} />
    </>
  )

  return (
    <BaseHeaderStyled ref={headerRef} {...props}>
      <Pressable onPress={handleCompactHeaderPress}>
        {hasCompactHeader && (
          <CompactHeaderContainer style={compactContentAnimatedStyle}>
            {isIos ? (
              <ActionAreaBlurred
                style={{ paddingTop, justifyContent: 'center', height: '100%' }}
                animatedProps={animatedBlurViewProps}
                tint={theme.name}
              >
                {compactHeaderContents}
              </ActionAreaBlurred>
            ) : (
              <ActionArea
                style={{ paddingTop, justifyContent: 'center', height: '100%', backgroundColor: theme.bg.back2 }}
              >
                {compactHeaderContents}
              </ActionArea>
            )}
          </CompactHeaderContainer>
        )}
        <ExpandedHeaderContainer style={expandedContentAnimatedStyle}>
          {HeaderLeft || HeaderRight ? (
            <>
              <ActionArea style={{ paddingTop }}>
                {HeaderLeft}
                {HeaderRight}
              </ActionArea>
              {headerTitle && (
                <TitleArea style={titleAnimatedStyle}>
                  <Title>{HeaderTitle}</Title>
                  {HeaderTitleRight}
                </TitleArea>
              )}
            </>
          ) : (
            <ActionArea style={{ paddingTop, paddingLeft: 0, paddingBottom: 0 }}>
              <TitleArea style={[titleAnimatedStyle]}>
                <Title>{HeaderTitle}</Title>
              </TitleArea>
            </ActionArea>
          )}
          {headerBottom && <HeaderBottomContent style={bottomContentAnimatedStyle}>{HeaderBottom}</HeaderBottomContent>}
          {showBorderBottom && <BottomBorder style={[bottomBorderColor, bottomBorderPosition]} />}
        </ExpandedHeaderContainer>
      </Pressable>
    </BaseHeaderStyled>
  )
}

export default BaseHeader

const BaseHeaderStyled = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`

const ExpandedHeaderContainer = styled(Animated.View)`
  flex-direction: column;
`

const actionAreaStyles = css`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px ${DEFAULT_MARGIN}px;
`

const ActionArea = styled(Animated.View)`
  ${actionAreaStyles}
`

const ActionAreaBlurred = styled(AnimatedBlurView)`
  ${actionAreaStyles}
`

const TitleArea = styled(Animated.View)`
  padding: 10px ${DEFAULT_MARGIN}px;
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 15px;
`

const Title = styled(AppText)`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.primary};
  align-self: flex-start;
  flex-shrink: 1;
`

const CompactTitle = styled(AppText)`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`

const BottomBorder = styled(Animated.View)`
  position: absolute;
  bottom: -1px;
  right: 0;
  left: 0;
  height: 1px;
`

const CompactHeaderContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 0px;
`

const HeaderBottomContent = styled(Animated.View)`
  height: 0px;
`

const CompactContent = styled.View`
  flex-direction: row;
  align-items: center;
`

const ScaledDownHeaderComponent = styled.View`
  transform: scale(0.85);
  align-items: center;
  flex: 1;
`

const ScaledDownHeaderComponentRight = styled(ScaledDownHeaderComponent)`
  align-items: flex-end;
  transform: scale(0.85) translateX(9px);
`

const ScaledDownHeaderComponentLeft = styled(ScaledDownHeaderComponent)`
  align-items: flex-start;
  transform: scale(0.85) translateX(-9px);
`

const CompactHeaderTitle = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  transform: scale(0.85);
  gap: 10px;
`
