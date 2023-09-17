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

import { useNavigation } from '@react-navigation/native'
import { StackHeaderProps } from '@react-navigation/stack'
import { BlurView } from 'expo-blur'
import { ReactNode, RefObject, useEffect } from 'react'
import { Platform, Pressable, StyleProp, ViewStyle } from 'react-native'
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
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { scrollScreenTo } from '~/utils/layout'

type HeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'>

export interface BaseHeaderProps {
  headerBottom?: () => ReactNode
  style?: StyleProp<ViewStyle>
  headerRef?: RefObject<Animated.View>
  options: HeaderOptions
  showCompactComponents?: boolean
}

export const scrollEndThreshold = 80
const defaultScrollRange = [0, scrollEndThreshold]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

// TODO: Reimplement tap bar to scroll up

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle },
  headerBottom,
  showCompactComponents,
  style,
  headerRef
}: BaseHeaderProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { scrollY, activeScreenRef } = useScrollContext()
  const navigation = useNavigation()

  const borderColorRange = ['transparent', theme.border.secondary]

  const hasCompactHeader = showCompactComponents !== undefined || headerTitle
  const paddingTop = Platform.OS === 'android' ? insets.top + 10 : insets.top

  const HeaderRight = headerRight && headerRight({})
  const HeaderLeft = headerLeft && headerLeft({})
  const HeaderBottom = headerBottom && headerBottom()
  const HeaderTitle = headerTitle && (typeof headerTitle === 'string' ? headerTitle : headerTitle.arguments['children'])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (scrollY) scrollY.value = 0
    })

    return unsubscribe
  }, [navigation, scrollY])

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
          opacity: interpolate(scrollY?.value || 0, defaultScrollRange, [1, 0], Extrapolate.CLAMP)
        }
      : {}
  )

  const animatedBlurViewProps = useAnimatedProps(() =>
    Platform.OS === 'ios'
      ? {
          intensity: interpolate(scrollY?.value || 0, defaultScrollRange, [0, 100], Extrapolate.CLAMP)
        }
      : {}
  )

  const bottomBorderColor = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY?.value || 0, defaultScrollRange, borderColorRange)
  }))

  const expandedContentAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader
      ? {
          transform: [
            { translateY: interpolate(scrollY?.value || 0, [20, scrollEndThreshold], [0, -15], Extrapolate.CLAMP) }
          ],
          opacity: interpolate(scrollY?.value || 0, [20, scrollEndThreshold], [1, 0], Extrapolate.CLAMP),
          zIndex: (scrollY?.value || 0) > scrollEndThreshold - 10 ? -1 : 0
        }
      : {}
  )

  const compactContentAnimatedStyle = useAnimatedStyle(() =>
    hasCompactHeader
      ? {
          opacity: interpolate(scrollY?.value || 0, [60, scrollEndThreshold], [0, 1], Extrapolate.CLAMP),
          height: interpolate(scrollY?.value || 0, [60, scrollEndThreshold], [110, 95], Extrapolate.CLAMP)
        }
      : {}
  )

  const handleCompactHeaderPress = () => {
    if (activeScreenRef?.current) {
      scrollScreenTo(0, activeScreenRef, true)
    }
  }

  return (
    <Animated.View style={style} ref={headerRef}>
      <Pressable onPress={handleCompactHeaderPress}>
        {hasCompactHeader && (
          <CompactHeaderContainer style={compactContentAnimatedStyle}>
            <ActionAreaBlurred
              style={{ paddingTop, justifyContent: 'center', height: '100%' }}
              animatedProps={animatedBlurViewProps}
              tint={theme.name}
            >
              {(showCompactComponents && (
                <CompactContent>
                  {headerBottom ? (
                    <ScaledDownHeaderComponent>{HeaderBottom}</ScaledDownHeaderComponent>
                  ) : (
                    <>
                      <ScaledDownHeaderComponentLeft>{HeaderLeft}</ScaledDownHeaderComponentLeft>
                      <CompactHeaderTitle>
                        <CompactTitle>{HeaderTitle}</CompactTitle>
                      </CompactHeaderTitle>
                      <ScaledDownHeaderComponentRight>{HeaderRight}</ScaledDownHeaderComponentRight>
                    </>
                  )}
                </CompactContent>
              )) || <CompactTitle>{HeaderTitle}</CompactTitle>}
              <BottomBorder style={bottomBorderColor} />
            </ActionAreaBlurred>
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
          <BottomBorder style={bottomBorderColor} />
        </ExpandedHeaderContainer>
      </Pressable>
    </Animated.View>
  )
}

export default BaseHeader

const ExpandedHeaderContainer = styled(Animated.View)`
  flex-direction: column;
`

const ActionArea = styled(Animated.View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px ${DEFAULT_MARGIN}px;
`

const ActionAreaBlurred = styled(AnimatedBlurView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px ${DEFAULT_MARGIN}px;
`

const TitleArea = styled(Animated.View)`
  padding: 10px ${DEFAULT_MARGIN}px;
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
`
