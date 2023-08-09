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
import { Pressable } from 'react-native'
import Reanimated, { Extrapolate, interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import { useScrollContext } from '~/contexts/ScrollContext'

const scrollRange = [0, 50]

const TopTabBar = ({ state, descriptors, navigation, position }: MaterialTopTabBarProps) => {
  const { scrollY } = useScrollContext()
  const theme = useTheme()

  const bgColorRange = [theme.bg.primary, theme.bg.secondary]
  const borderColorRange = ['transparent', theme.border.secondary]
  const insets = useSafeAreaInsets()

  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY?.value || 0, scrollRange, bgColorRange),
    borderColor: interpolateColor(scrollY?.value || 0, scrollRange, borderColorRange)
  }))

  return (
    <Reanimated.View style={[headerStyle, { paddingTop: insets.top + 15 }]}>
      <TabsRow>
        {state.routes.map((route, index) => (
          <TabBarItem
            key={route.name}
            descriptors={descriptors}
            route={route}
            state={state}
            index={index}
            navigation={navigation}
            position={position}
          />
        ))}
      </TabsRow>
    </Reanimated.View>
  )
}

interface TabBarItemProps {
  state: MaterialTopTabBarProps['state']
  navigation: MaterialTopTabBarProps['navigation']
  position: MaterialTopTabBarProps['position']
  descriptors: MaterialTopTabBarProps['descriptors']
  route: MaterialTopTabBarProps['state']['routes'][number]
  index: number
}

// Inspired by https://reactnavigation.org/docs/material-top-tab-navigator/#tabbar
const TabBarItem = ({ descriptors, route, state, index, navigation, position }: TabBarItemProps) => {
  const { scrollY } = useScrollContext()
  const theme = useTheme()

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

  const textStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY?.value || 0, scrollRange, [28, 18], Extrapolate.CLAMP),
    opacity: isFocused ? 1 : 0.3,
    borderBottomColor: isFocused ? theme.font.primary : 'transparent'
  }))

  return (
    <Pressable
      key={route.name}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <ReanimatedText style={textStyle}>{label}</ReanimatedText>
    </Pressable>
  )
}

export default TopTabBar

const TabsRow = styled.View`
  flex-direction: row;
  gap: 20px;
  border-bottom-color: ${({ theme }) => theme.border.secondary};
  border-bottom-width: 1px;
  padding: 0 20px;
`

const ReanimatedText = styled(Reanimated.Text)`
  padding: 18px 0;
  font-weight: 600;
  border-bottom-width: 1px;
  margin-bottom: -1px;
`
