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

import { BottomTabNavigationEventMap, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { NavigationHelpers, ParamListBase } from '@react-navigation/native'
import { TouchableWithoutFeedback } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface FooterMenuItemProps {
  options: BottomTabNavigationOptions
  isFocused: boolean
  routeName: string
  target: string
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>
}

const FooterMenuItem = ({ options, isFocused, routeName, target, navigation }: FooterMenuItemProps) => {
  const theme = useTheme()

  const Icon =
    options.tabBarIcon &&
    options.tabBarIcon({
      focused: isFocused,
      color: isFocused ? theme.font.primary : theme.font.tertiary,
      size: 24
    })

  const label = (options.tabBarLabel as string) ?? options.title ?? routeName

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target,
      canPreventDefault: true
    })

    vibrate(ImpactStyle.Medium)

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName)
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
}

export default FooterMenuItem

const Tab = styled.View<{ active: boolean }>`
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS * 0.7}px;
  width: 90px;
`

const TabText = styled.Text<{ isActive?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme, isActive }) => (isActive ? theme.font.primary : theme.font.tertiary)};
  margin: 3px 0;
`
