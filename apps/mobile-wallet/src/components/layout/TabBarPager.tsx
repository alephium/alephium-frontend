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

import { ReactNode, useRef } from 'react'
import { ScrollViewProps } from 'react-native'
import PagerView, { PagerViewOnPageScrollEventData, PagerViewProps } from 'react-native-pager-view'
import Animated, { AnimatedProps, measure, runOnJS, useAnimatedRef, useSharedValue } from 'react-native-reanimated'
import styled from 'styled-components/native'

import BaseHeader from '~/components/headers/BaseHeader'
import { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import Screen from '~/components/layout/Screen'
import TabBarHeader from '~/components/TopTabBar'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useTabScrollHandler from '~/hooks/layout/useTabScrollHandler'

export interface TabBarPageProps {
  contentStyle?: AnimatedProps<ScrollViewProps>['style']
  onScroll?: Required<ScrollViewProps>['onScroll']
}

export type TabBarPageScreenProps = BottomBarScrollScreenProps & TabBarPageProps

interface TabBarScreenProps extends Omit<PagerViewProps, 'children'> {
  headerTitle: string
  pages: Array<(props: TabBarPageScreenProps) => ReactNode>
  tabLabels: string[]
}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const TabBarPager = ({ pages, tabLabels, headerTitle, ...props }: TabBarScreenProps) => {
  const pagerRef = useRef<PagerView>(null)
  const tabBarRef = useAnimatedRef<Animated.View>()
  const tabBarPageY = useSharedValue<number>(120)
  const pagerScrollEvent = useSharedValue<PagerViewOnPageScrollEventData>({
    position: 0,
    offset: 0
  })
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  const updateTabBarY = (newValue?: number) => {
    if (newValue && tabBarPageY.value !== newValue) {
      tabBarPageY.value = newValue
    }
  }

  const pageScrollHandler = useTabScrollHandler((e: PagerViewOnPageScrollEventData) => {
    'worklet'

    const newTabBarPageY = measure(tabBarRef)?.pageY

    runOnJS(updateTabBarY)(newTabBarPageY)

    pagerScrollEvent.value = e
  })

  const handleTabPress = (tabIndex: number) => {
    pagerRef.current?.setPage(tabIndex)
  }

  const TabBar = (
    <TabBarHeader
      tabLabels={tabLabels}
      pagerScrollEvent={pagerScrollEvent}
      onTabPress={handleTabPress}
      tabBarRef={tabBarRef}
    />
  )

  return (
    <Screen>
      <BaseHeader options={{ headerTitle }} scrollY={screenScrollY} CustomContent={TabBar} />
      <StyledPagerView initialPage={0} onPageScroll={pageScrollHandler} ref={pagerRef} {...props}>
        {pages.map((Page, i) => (
          <WrappedPage key={i} Page={Page} onScroll={screenScrollHandler} />
        ))}
      </StyledPagerView>
    </Screen>
  )
}

export default TabBarPager

const WrappedPage = ({
  Page,
  onScroll
}: {
  Page: (props: TabBarPageProps) => ReactNode
  onScroll: Required<TabBarPageProps>['onScroll']
}) => <Page onScroll={onScroll} contentStyle={{ marginTop: 15 }} />

const StyledPagerView = styled(AnimatedPagerView)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.back2};
`
