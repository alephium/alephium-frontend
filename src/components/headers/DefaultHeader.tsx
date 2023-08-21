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
  useAnimatedProps,
  useAnimatedStyle
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { useScrollContext } from '~/contexts/ScrollContext'
import { HORIZONTAL_MARGIN } from '~/style/globalStyle'

export interface DefaultHeaderProps {
  HeaderLeft?: ReactNode
  HeaderRight?: ReactNode
  headerTitle?: string
  HeaderCompactContent?: ReactNode
  bgColor?: string
  style?: StyleProp<ViewStyle>
}

const scrollRange = [0, 50]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const DefaultHeader = ({
  HeaderRight,
  HeaderLeft,
  headerTitle,
  HeaderCompactContent,
  bgColor,
  style
}: DefaultHeaderProps) => {
  const theme = useTheme()
  const { scrollY } = useScrollContext()
  const insets = useSafeAreaInsets()

  const bgColorRange = [bgColor ?? theme.bg.secondary, theme.bg.primary]
  const borderColorRange = ['transparent', theme.border.secondary]

  const titleAnimatedStyle = useAnimatedStyle(() =>
    HeaderCompactContent || headerTitle
      ? {
          transform: [{ translateY: interpolate(scrollY?.value || 0, scrollRange, [0, -20], Extrapolate.CLAMP) }],
          opacity: interpolate(scrollY?.value || 0, scrollRange, [1, 0])
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

  const animatedBlurViewProps = useAnimatedProps(() =>
    Platform.OS === 'ios'
      ? {
          intensity: interpolate(scrollY?.value || 0, scrollRange, [0, 100], Extrapolate.CLAMP)
        }
      : {}
  )

  if (Platform.OS === 'android') {
    return (
      <Animated.View style={[style, androidHeaderColor, { paddingTop: insets.top }]}>
        {HeaderLeft}
        {HeaderRight}
        {headerTitle && <Title>{headerTitle}</Title>}
        <BottomBorder style={bottomBorderColor} />
      </Animated.View>
    )
  } else {
    return (
      <Animated.View>
        <FullContent>
          <ActionArea
            style={[style, { paddingTop: insets.top }]}
            animatedProps={animatedBlurViewProps}
            tint={theme.name}
          >
            {HeaderLeft}
            {HeaderRight}
            <BottomBorder style={bottomBorderColor} />
          </ActionArea>
          {headerTitle && (
            <TitleArea style={titleAnimatedStyle}>
              <Title>{headerTitle}</Title>
            </TitleArea>
          )}
        </FullContent>
      </Animated.View>
    )
  }
}

export default styled(DefaultHeader)`
  position: relative;
`

const FullContent = styled.View`
  flex-direction: column;
`

const ActionArea = styled(AnimatedBlurView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px ${HORIZONTAL_MARGIN}px;
`

const TitleArea = styled(Animated.View)`
  padding: 10px ${HORIZONTAL_MARGIN}px;
`

const Title = styled(AppText)`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.primary};
`

const BottomBorder = styled(Animated.View)`
  position: absolute;
  bottom: -1px;
  right: 0;
  left: 0;
  height: 1px;
`

const HeaderCompactContentContainer = styled(Animated.View)``
