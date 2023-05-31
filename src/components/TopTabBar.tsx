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

import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'
import { Animated } from 'react-native'
import styled from 'styled-components/native'

import { ScreenSection } from '~/components/layout/Screen'

const TopTabBar = ({ state, descriptors, navigation, position }: MaterialTopTabBarProps) => {
  const opacityInterpolationInputRange = state.routes.map((_, i) => i)

  return (
    <ScreenSection>
      <TopTabBarStyled>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.title !== undefined ? options.title : route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true
            })

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate({ name: route.name, params: route.params, merge: true })
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key
            })
          }

          const textStyles = {
            opacity: position.interpolate({
              inputRange: opacityInterpolationInputRange,
              outputRange: opacityInterpolationInputRange.map((i) => (i === index ? 1 : 0.3))
            })
          }

          return (
            <TabItem
              key={route.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              <TabItemText style={textStyles}>{label}</TabItemText>
            </TabItem>
          )
        })}
      </TopTabBarStyled>
    </ScreenSection>
  )
}

export default TopTabBar

const TopTabBarStyled = styled.View`
  flex-direction: row;
  margin-top: 50px;
  gap: 20px;
`

const TabItem = styled.Pressable``

const TabItemText = styled(Animated.Text)`
  font-size: 28px;
  font-weight: 600;
`
