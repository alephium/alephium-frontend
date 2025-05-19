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
  customHeaderContent?: ReactNode
  onTabChange?: (tabIndex: number) => void
}

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const TabBarPager = ({
  pages,
  tabLabels,
  headerTitle,
  customHeaderContent,
  onTabChange,
  ...props
}: TabBarScreenProps) => {
  const pagerRef = useRef<PagerView>(null)
  const tabBarRef = useAnimatedRef<Animated.View>()
  const tabBarPageY = useSharedValue<number>(120)
  const pagerScrollEvent = useSharedValue<PagerViewOnPageScrollEventData>({
    position: 0,
    offset: 0
  })
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  const updateTabBarY = (newValue?: number) => {
    if (newValue && tabBarPageY.get() !== newValue) {
      tabBarPageY.set(newValue)
    }
  }

  const pageScrollHandler = useTabScrollHandler((e: PagerViewOnPageScrollEventData) => {
    'worklet'

    const newTabBarPageY = measure(tabBarRef)?.pageY

    runOnJS(updateTabBarY)(newTabBarPageY)

    pagerScrollEvent.set(e)
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
      customContent={customHeaderContent}
    />
  )

  return (
    <Screen>
      <BaseHeader options={{ headerTitle }} scrollY={screenScrollY} CustomContent={TabBar} isCentered={false} />
      <StyledPagerView
        initialPage={0}
        onPageScroll={pageScrollHandler}
        ref={pagerRef}
        onPageSelected={({ nativeEvent: { position } }) => onTabChange?.(position)}
        {...props}
      >
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
}) => <Page onScroll={onScroll} contentStyle={{ marginTop: 50 }} />

const StyledPagerView = styled(AnimatedPagerView)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.back2};
`
