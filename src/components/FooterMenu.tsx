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
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '../style/globalStyle'

interface FooterMenuProps extends BottomTabBarProps {
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ state, descriptors, navigation, style }: FooterMenuProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
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
              <OverviewTab>
                {Icon}
                <TabText isActive={isFocused}>{label}</TabText>
              </OverviewTab>
            </TouchableWithoutFeedback>
          )
        })}
      </MenuItems>
    </View>
  )
}

export default memo(styled(FooterMenu)`
  position: absolute;
  bottom: 35px;
  width: 100%;
  padding: 0 55px;
`)

const MenuItems = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  background-color: white;
  border-radius: ${BORDER_RADIUS}px;
  padding: 15px;
  ${({ theme }) => theme.shadow.tertiary};
`

const Tab = styled(View)`
  align-items: center;
`

const OverviewTab = styled(Tab)`
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
`

const TransferTab = styled(Tab)`
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
`

const TabText = styled(Text)<{ isActive?: boolean }>`
  font-weight: 700;
  color: ${({ theme, isActive }) => (isActive ? theme.font.primary : theme.font.tertiary)};
`
