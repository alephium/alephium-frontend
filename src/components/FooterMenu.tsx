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
import React, { memo } from 'react'
import { StyleProp, Text, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '../style/globalStyle'

interface FooterMenuProps extends BottomTabBarProps {
  scrollY: SharedValue<number>
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ state, descriptors, navigation, style, scrollY }: FooterMenuProps) => {
  const theme = useTheme()

  const footerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 50], [0, 100])
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
  bottom: 35px;
  width: 100%;
  align-items: center;
`)

const MenuItems = styled(View)`
  width: 75%;
  max-width: 350px;
  min-width: 300px;
  flex-direction: row;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: ${BORDER_RADIUS}px;
  ${({ theme }) => theme.shadow.tertiary};
  padding: 5px;
`

const Tab = styled(View)<{ active: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: space-between;
  border-radius: ${BORDER_RADIUS * 0.7}px;
  background-color: ${({ theme, active }) => (active ? theme.bg.tertiary : 'transparent')};
  height: 60px;
  padding: 8px 0 5px 0;
`

const TabText = styled(Text)<{ isActive?: boolean }>`
  font-weight: 700;
  color: ${({ theme, isActive }) => (isActive ? theme.font.primary : theme.font.tertiary)};
`
