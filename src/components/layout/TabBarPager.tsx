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

import { ReactNode, useRef } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps } from 'react-native'
import PagerView, { PagerViewOnPageScrollEventData, PagerViewProps } from 'react-native-pager-view'
import Animated, {
  AnimatedScrollViewProps,
  AnimateProps,
  measure,
  runOnJS,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import BaseHeader from '~/components/headers/BaseHeader'
import TopTabBar from '~/components/TopTabBar'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useTabScrollHandler from '~/hooks/layout/useTabScrollHandler'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface TabBarPageProps extends AnimatedScrollViewProps {
  contentStyle?: AnimateProps<ScrollViewProps>['style']
  onScroll?: Required<ScrollViewProps>['onScroll']
}

interface TabBarScreenProps extends Omit<PagerViewProps, 'children'> {
  headerTitle: string
  pages: Array<(props: TabBarPageProps) => ReactNode>
  tabLabels: string[]
}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const TabBarPager = ({ pages, tabLabels, headerTitle, ...props }: TabBarScreenProps) => {
  const pagerRef = useRef<PagerView>(null)

  const handleScroll = useScreenScrollHandler()

  const tabBarRef = useAnimatedRef<Animated.View>()
  const tabBarPageY = useSharedValue<number>(120)

  const theme = useTheme()

  const pagerScrollEvent = useSharedValue<PagerViewOnPageScrollEventData>({
    position: 0,
    offset: 0
  })

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

  const TabBar = () => (
    <TopTabBar
      tabLabels={tabLabels}
      pagerScrollEvent={pagerScrollEvent}
      onTabPress={handleTabPress}
      tabBarRef={tabBarRef}
    />
  )

  return (
    <>
      <AnimatedPagerView
        initialPage={0}
        onPageScroll={pageScrollHandler}
        style={{ flex: 1, backgroundColor: theme.bg.back2 }}
        ref={pagerRef}
        {...props}
      >
        {pages.map((Page, i) => (
          <WrappedPage
            index={i}
            key={i}
            Page={Page}
            onScroll={handleScroll}
            pagerScrollEvent={pagerScrollEvent}
            tabBarPageY={tabBarPageY}
          />
        ))}
      </AnimatedPagerView>
      <HeaderContainer>
        <BaseHeader
          options={{
            headerTitle
          }}
          headerBottom={() => <TabBar />}
          showCompactComponents
        />
      </HeaderContainer>
    </>
  )
}

export default TabBarPager

const WrappedPage = ({
  Page,
  onScroll,
  index,
  pagerScrollEvent,
  tabBarPageY
}: {
  Page: (props: TabBarPageProps) => ReactNode
  onScroll: Required<TabBarPageProps>['onScroll']
  index: number
  pagerScrollEvent: SharedValue<PagerViewOnPageScrollEventData>
  tabBarPageY: SharedValue<number>
}) => {
  const insets = useSafeAreaInsets()

  const pageAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: tabBarPageY.value + insets.top + DEFAULT_MARGIN
  }))

  return (
    <Page
      contentStyle={pagerScrollEvent.value.position !== index ? pageAnimatedStyle : [{ paddingTop: 190 }]}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScroll(e)
      }}
    />
  )
}

const HeaderContainer = styled.View`
  position: absolute;
  right: 0;
  left: 0;
`
