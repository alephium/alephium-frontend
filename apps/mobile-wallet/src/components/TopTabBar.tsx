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

import { useState } from 'react'
import { LayoutChangeEvent, LayoutRectangle, PressableProps } from 'react-native'
import { PagerViewOnPageScrollEventData } from 'react-native-pager-view'
import Reanimated, { AnimatedRef, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS, DEFAULT_MARGIN } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

type TabsLayout = Record<number, LayoutRectangle>

interface TopTabBarProps {
  tabLabels: string[]
  pagerScrollEvent: SharedValue<PagerViewOnPageScrollEventData>
  onTabPress: (index: number) => void
  tabBarRef?: AnimatedRef<Reanimated.View>
}

const indicatorXPadding = 10

const TopTabBar = ({ tabLabels, pagerScrollEvent, onTabPress, tabBarRef }: TopTabBarProps) => {
  const [tabLayouts, setTabLayouts] = useState<TabsLayout>({})
  const theme = useTheme()

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
  }, [tabLayouts, tabLabels.length])

  const handleOnTabPress = (tabIndex: number) => {
    vibrate(ImpactStyle.Medium)
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
    <HeaderContainer ref={tabBarRef}>
      <Indicator
        style={[
          indicatorStyle,
          {
            shadowColor: 'black',
            shadowOffset: { height: 3, width: 0 },
            shadowOpacity: theme.name === 'dark' ? 0 : 0.08,
            shadowRadius: 5,
            elevation: 10
          }
        ]}
      />
      {tabLabels.map((label, i) => (
        <TabBarItem
          key={label}
          label={label}
          onPress={() => handleOnTabPress(i)}
          onLayout={(e) => handleTabLayoutEvent(i, e)}
        />
      ))}
    </HeaderContainer>
  )
}

interface TabBarItemProps extends PressableProps {
  label: string
}

const TabBarItem = ({ label, ...props }: TabBarItemProps) => (
  <TabBarItemStyled key={label} accessibilityRole="button" {...props}>
    <AppText semiBold size={16}>
      {label}
    </AppText>
  </TabBarItemStyled>
)

export default TopTabBar

const HeaderContainer = styled(Reanimated.View)`
  flex-direction: row;
  gap: 25px;
  align-items: center;
  height: 44px;
  padding: 0 ${DEFAULT_MARGIN + indicatorXPadding}px;
`

const TabBarItemStyled = styled.Pressable`
  height: 100%;
  justify-content: center;
`

const Indicator = styled(Reanimated.View)`
  position: absolute;
  height: 80%;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${({ theme }) => theme.bg.highlight};
`
