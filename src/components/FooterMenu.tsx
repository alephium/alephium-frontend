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

import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { memo } from 'react'
import { StyleProp, TouchableWithoutFeedback, ViewStyle } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { useInWalletLayoutContext } from '../contexts/InWalletLayoutContext'
import { BORDER_RADIUS } from '../style/globalStyle'

interface FooterMenuProps extends BottomTabBarProps {
  style?: StyleProp<ViewStyle>
}

const footerDistanceFromBottom = 35
const footerMenuItemsPadding = 5
const footerTabHeight = 60

const totalFooterHeight = footerMenuItemsPadding * 2 + footerTabHeight
const topFooterPosition = footerDistanceFromBottom + totalFooterHeight

const scrollRange = [0, 80]
const translateRange = [0, topFooterPosition]

const FooterMenu = ({ state, descriptors, navigation, style }: FooterMenuProps) => {
  const theme = useTheme()
  const { scrollY } = useInWalletLayoutContext()

  const scrollDirection = useSharedValue<'up' | 'down'>('down')

  const lastScrollY = useSharedValue(0)
  const lastTranslateY = useSharedValue(0)

  const translateYValue = useDerivedValue(() => {
    if (scrollY === undefined) return 0

    let value = lastTranslateY.value

    if (scrollDirection.value === 'down' && lastScrollY.value > scrollY.value) {
      scrollDirection.value = 'up'
    }

    if (scrollDirection.value === 'up' && lastScrollY.value < scrollY.value) {
      scrollDirection.value = 'down'
    }

    if (value >= scrollRange[0] && value <= scrollRange[1]) {
      const deltaScroll = Math.abs(scrollY.value - lastScrollY.value)
      scrollDirection.value === 'down' ? (value += deltaScroll) : (value -= deltaScroll)
    }

    // Avoid overshoot
    value = value < scrollRange[0] ? scrollRange[0] : value > scrollRange[1] ? scrollRange[1] : value

    if (
      scrollDirection.value === 'down' &&
      scrollY.value > footerDistanceFromBottom * (scrollRange[1] / translateRange[1])
    ) {
      value = scrollRange[1]
    }

    if (scrollDirection.value === 'up') {
      value = scrollRange[0]
    }

    lastScrollY.value = scrollY.value
    lastTranslateY.value = value

    return value
  })

  const footerStyle = useAnimatedStyle(() => {
    const translateY = withTiming(interpolate(translateYValue.value, scrollRange, translateRange), {
      duration: 100
    })

    return {
      transform: [{ translateY }]
    }
  })

  return (
    <Animated.View style={[style, footerStyle]}>
      <MenuItems>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index

          const Icon =
            options.tabBarIcon &&
            options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? theme.font.primary : theme.font.tertiary,
              size: 24
            })

          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TouchableWithoutFeedback onPress={onPress} key={label}>
              <Tab active={isFocused}>
                {Icon}
                <TabText isActive={isFocused}>{label}</TabText>
              </Tab>
            </TouchableWithoutFeedback>
          )
        })}
      </MenuItems>
    </Animated.View>
  )
}

export default memo(styled(FooterMenu)`
  position: absolute;
  bottom: ${footerDistanceFromBottom}px;
  width: 100%;
  align-items: center;
`)

const MenuItems = styled.View`
  width: 75%;
  max-width: 350px;
  min-width: 300px;
  flex-direction: row;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: ${BORDER_RADIUS}px;
  ${({ theme }) => theme.shadow.tertiary};
  padding: ${footerMenuItemsPadding}px;
`

const Tab = styled.View<{ active: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: space-between;
  border-radius: ${BORDER_RADIUS * 0.7}px;
  background-color: ${({ theme, active }) => (active ? theme.bg.tertiary : 'transparent')};
  height: ${footerTabHeight}px;
  padding: 8px 0 5px 0;
`

const TabText = styled.Text<{ isActive?: boolean }>`
  font-weight: 700;
  color: ${({ theme, isActive }) => (isActive ? theme.font.primary : theme.font.tertiary)};
`
