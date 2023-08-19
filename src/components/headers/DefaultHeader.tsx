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

export interface DefaultHeaderProps {
  HeaderLeft: ReactNode
  HeaderRight?: ReactNode
  bgColor?: string
  style?: StyleProp<ViewStyle>
}

const scrollRange = [0, 50]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const DefaultHeader = ({ HeaderRight, HeaderLeft, bgColor, style }: DefaultHeaderProps) => {
  const theme = useTheme()
  const { scrollY } = useScrollContext()
  const insets = useSafeAreaInsets()

  const bgColorRange = [bgColor ?? 'tranparent', theme.bg.secondary]
  const borderColorRange = ['transparent', theme.border.secondary]

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
        {typeof HeaderLeft === 'string' ? <Title>{HeaderLeft}</Title> : HeaderLeft}
        {HeaderRight}
        <BottomBorder style={bottomBorderColor} />
      </Animated.View>
    )
  } else {
    return (
      <AnimatedBlurView
        style={[style, { paddingTop: insets.top }]}
        animatedProps={animatedBlurViewProps}
        tint={theme.name}
      >
        {typeof HeaderLeft === 'string' ? <Title>{HeaderLeft}</Title> : HeaderLeft}
        {HeaderRight}
        <BottomBorder style={bottomBorderColor} />
      </AnimatedBlurView>
    )
  }
}

export default styled(DefaultHeader)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
`

const Title = styled(AppText)`
  font-size: 28px;
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
