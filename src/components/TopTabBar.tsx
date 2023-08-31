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

import { colord } from 'colord'
import { useState } from 'react'
import { LayoutChangeEvent, LayoutRectangle, Pressable, PressableProps } from 'react-native'
import { PagerViewOnPageScrollEventData } from 'react-native-pager-view'
import Reanimated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS, HORIZONTAL_MARGIN } from '~/style/globalStyle'

type TabsLayout = Record<number, LayoutRectangle>

interface TopTabBarProps {
  tabLabels: string[]
  pagerScrollEvent: SharedValue<PagerViewOnPageScrollEventData>
  onTabPress: (index: number) => void
}

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable)

const indicatorXPadding = 10

// TODO: Reimplement tap bar to scroll up

const TopTabBar = ({ tabLabels, pagerScrollEvent, onTabPress }: TopTabBarProps) => {
  const [tabLayouts, setTabLayouts] = useState<TabsLayout>({})

  const indicatorStyle = useAnimatedStyle(() => {
    const positionsArray = [...Array(tabLabels.length).keys()]
    const tabLayoutValues = Object.values(tabLayouts)

    if (tabLayoutValues.length !== positionsArray.length) return {}

    const x = interpolate(
      pagerScrollEvent.value.offset + pagerScrollEvent.value.position,
      positionsArray,
      Object.values(tabLayouts).map((l) => l.x)
    )

    const width = interpolate(
      pagerScrollEvent.value.offset + pagerScrollEvent.value.position,
      positionsArray,
      Object.values(tabLayouts).map((l) => l.width)
    )

    return {
      left: x - indicatorXPadding,
      width: width + 2 * indicatorXPadding
    }
  }, [tabLayouts])

  const handleOnTabPress = (tabIndex: number) => {
    onTabPress(tabIndex)
  }

  const handleTabLayoutEvent = (tabIndex: number, e: LayoutChangeEvent) => {
    e.persist()

    setTabLayouts((s) => ({
      [tabIndex]: e.nativeEvent.layout,
      ...s
    }))
  }

  return (
    <TabsRow>
      <Indicator style={indicatorStyle} />
      {tabLabels.map((label, i) => (
        <TabBarItem
          key={label}
          label={label}
          onPress={() => handleOnTabPress(i)}
          onLayout={(e) => handleTabLayoutEvent(i, e)}
        />
      ))}
    </TabsRow>
  )
}

interface TabBarItemProps extends PressableProps {
  label: string
  onPress: () => void
  onLayout: ((event: LayoutChangeEvent) => void) | undefined
}

const TabBarItem = ({ label, onPress, onLayout }: TabBarItemProps) => (
  <TabBarItemStyled key={label} accessibilityRole="button" onPress={onPress} onLayout={onLayout}>
    <AppText semiBold size={16}>
      {label}
    </AppText>
  </TabBarItemStyled>
)

export default TopTabBar

const TabsRow = styled.View`
  flex-direction: row;
  gap: 25px;
  align-items: center;
  height: 50px;
  padding: 0 ${HORIZONTAL_MARGIN + indicatorXPadding}px;
`

const TabBarItemStyled = styled.Pressable`
  height: 100%;
  justify-content: center;
`

const Indicator = styled(Reanimated.View)`
  position: absolute;
  height: 70%;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${({ theme }) => colord(theme.button.primary).alpha(0.8).toHex()};
`
