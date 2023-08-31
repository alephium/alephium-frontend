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

import { BlurView } from 'expo-blur'
import { ReactNode } from 'react'
import { Platform, StyleProp, ViewStyle } from 'react-native'
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
import { HORIZONTAL_MARGIN } from '~/style/globalStyle'

export interface BaseHeaderProps {
  HeaderLeft?: ReactNode
  HeaderRight?: ReactNode
  headerTitle?: string
  HeaderBottom?: ReactNode
  HeaderCompactContent?: ReactNode
  scrollY?: SharedValue<number>
  bgColor?: string
  style?: StyleProp<ViewStyle>
}

const scrollRange = [0, 90]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

// TODO: Reimplement tap bar to scroll up

const BaseHeader = ({
  HeaderRight,
  HeaderLeft,
  headerTitle,
  HeaderBottom,
  HeaderCompactContent,
  scrollY,
  bgColor,
  style
}: BaseHeaderProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const bgColorRange = [bgColor ?? theme.bg.secondary, theme.bg.primary]
  const borderColorRange = ['transparent', theme.border.secondary]

  const hasCompactHeader = HeaderCompactContent !== undefined || headerTitle

  const titleAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader || headerTitle
      ? {
          transform: [
            { translateY: interpolate(scrollY?.value || 0, [0, 70], [0, -50], Extrapolate.CLAMP) },
            { translateX: interpolate(scrollY?.value || 0, [0, -100], [0, 3], Extrapolate.CLAMP) },
            { scale: interpolate(scrollY?.value || 0, [0, -100], [1, 1.05], Extrapolate.CLAMP) }
          ],
          opacity: interpolate(scrollY?.value || 0, [0, 70], [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const bottomContentAnimatedStyle = useAnimatedStyle(() =>
    HeaderBottomContent !== undefined
      ? {
          transform: [{ translateY: interpolate(scrollY?.value || 0, [0, 70], [0, -50], Extrapolate.CLAMP) }],
          opacity: interpolate(scrollY?.value || 0, [0, 90], [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const animatedBlurViewProps = useAnimatedProps(() =>
    Platform.OS === 'ios'
      ? {
          intensity: interpolate(scrollY?.value || 0, scrollRange, [0, 80], Extrapolate.CLAMP)
        }
      : {}
  )

  const androidHeaderColor = useAnimatedStyle(() =>
    Platform.OS === 'android'
      ? {
          backgroundColor: interpolateColor(scrollY?.value || 0, scrollRange, bgColorRange)
        }
      : {}
  )

  const bottomBorderColor = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY?.value || 0, scrollRange, borderColorRange)
  }))

  const fullContentAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader
      ? {
          transform: [{ translateY: interpolate(scrollY?.value || 0, [20, 90], [0, -15], Extrapolate.CLAMP) }],
          opacity: interpolate(scrollY?.value || 0, [20, 90], [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const compactContentAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader
      ? {
          opacity: interpolate(scrollY?.value || 0, [60, 90], [0, 1], Extrapolate.CLAMP),
          height: interpolate(scrollY?.value || 0, [60, 90], [130, 100], Extrapolate.CLAMP)
        }
      : {}
  )

  if (Platform.OS === 'android') {
    return (
      <Animated.View style={[style, androidHeaderColor, { paddingTop: insets.top }]}>
        {HeaderLeft}
        {HeaderRight}
        {headerTitle && <Title>{headerTitle}</Title>}
        {HeaderBottom}
        <BottomBorder style={bottomBorderColor} />
      </Animated.View>
    )
  } else {
    return (
      <Animated.View style={style}>
        <FullContent style={fullContentAnimatedStyle}>
          {HeaderLeft || HeaderRight ? (
            <>
              <ActionAreaBlurred
                animatedProps={animatedBlurViewProps}
                tint={theme.name}
                style={{ paddingTop: insets.top }}
              >
                {HeaderLeft}
                {HeaderRight}
              </ActionAreaBlurred>
              {headerTitle && (
                <TitleArea style={titleAnimatedStyle}>
                  <Title>{headerTitle}</Title>
                </TitleArea>
              )}
            </>
          ) : (
            <ActionAreaBlurred
              animatedProps={animatedBlurViewProps}
              tint={theme.name}
              style={{ paddingTop: insets.top, paddingLeft: 0, paddingBottom: 0 }}
            >
              <TitleArea style={[titleAnimatedStyle]}>
                <Title>{headerTitle}</Title>
              </TitleArea>
            </ActionAreaBlurred>
          )}
          {HeaderBottom && <HeaderBottomContent style={bottomContentAnimatedStyle}>{HeaderBottom}</HeaderBottomContent>}
          <BottomBorder style={bottomBorderColor} />
        </FullContent>
        {(HeaderCompactContent || headerTitle) && (
          <CompactContent style={compactContentAnimatedStyle}>
            <ActionAreaBlurred
              style={{ paddingTop: insets.top, justifyContent: 'center', height: '100%' }}
              animatedProps={animatedBlurViewProps}
              tint={theme.name}
            >
              {HeaderCompactContent || <CompactTitle>{headerTitle}</CompactTitle>}
              <BottomBorder style={bottomBorderColor} />
            </ActionAreaBlurred>
          </CompactContent>
        )}
      </Animated.View>
    )
  }
}

export default BaseHeader

const FullContent = styled(Animated.View)`
  flex-direction: column;
`

const ActionAreaBlurred = styled(AnimatedBlurView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px ${HORIZONTAL_MARGIN}px;
`

const TitleArea = styled(Animated.View)`
  padding: 10px ${HORIZONTAL_MARGIN}px;
  align-self: flex-start;
`

const Title = styled(AppText)`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.primary};
  align-self: flex-start;
`

const CompactTitle = styled(AppText)`
  font-size: 15px;
  font-weight: 600;
`

const BottomBorder = styled(Animated.View)`
  position: absolute;
  bottom: -1px;
  right: 0;
  left: 0;
  height: 1px;
`

const CompactContent = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 0px;
`

const HeaderBottomContent = styled(Animated.View)`
  height: 0px;
`
