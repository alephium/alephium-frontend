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
import PagerView, { PagerViewOnPageScrollEventData, PagerViewProps } from 'react-native-pager-view'
import Animated, { SharedValue, useSharedValue } from 'react-native-reanimated'
import { useTheme } from 'styled-components'
import styled from 'styled-components/native'

import BaseHeader from '~/components/headers/BaseHeader'
import TopTabBar from '~/components/TopTabBar'
import useTabScrollHandler from '~/hooks/layout/useTabScrollHandler'

interface TabBarScreenProps extends PagerViewProps {
  headerTitle: string
  children: ReactNode
  scrollY: SharedValue<number>
  tabLabels: string[]
}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const TabBarScreen = ({ children, scrollY, tabLabels, headerTitle, ...props }: TabBarScreenProps) => {
  const pagerRef = useRef<PagerView>(null)

  const theme = useTheme()

  const pagerScrollEvent = useSharedValue<PagerViewOnPageScrollEventData>({
    position: 0,
    offset: 0
  })

  const pageScrollHandler = useTabScrollHandler({
    onPageScroll: (e: PagerViewOnPageScrollEventData) => {
      'worklet'
      pagerScrollEvent.value = e
    }
  })

  const handleTabPress = (tabIndex: number) => {
    pagerRef.current?.setPage(tabIndex)
  }

  return (
    <>
      <AnimatedPagerView
        initialPage={0}
        onPageScroll={pageScrollHandler}
        style={{ flex: 1, backgroundColor: theme.bg.back2 }}
        ref={pagerRef}
        {...props}
      >
        {children}
      </AnimatedPagerView>
      <HeaderContainer>
        <BaseHeader
          headerTitle={headerTitle}
          HeaderBottom={
            <TopTabBar tabLabels={tabLabels} pagerScrollEvent={pagerScrollEvent} onTabPress={handleTabPress} />
          }
          HeaderCompactContent={
            <TopTabBar tabLabels={tabLabels} pagerScrollEvent={pagerScrollEvent} onTabPress={handleTabPress} />
          }
          scrollY={scrollY}
        />
      </HeaderContainer>
    </>
  )
}

export default TabBarScreen

const HeaderContainer = styled.View`
  position: absolute;
  right: 0;
  left: 0;
`
