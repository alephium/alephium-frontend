import { ReactNode, useState } from 'react'
import { ScrollViewProps, StyleSheet } from 'react-native'
import Animated, { AnimatedProps, FadeIn, FadeOut, useAnimatedRef } from 'react-native-reanimated'
import styled from 'styled-components/native'

import BaseHeader from '~/components/headers/BaseHeader'
import { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import Screen from '~/components/layout/Screen'
import TabBarHeader from '~/components/TopTabBar'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'

export interface TabBarPageProps {
  contentStyle?: AnimatedProps<ScrollViewProps>['style']
  onScroll?: Required<ScrollViewProps>['onScroll']
}

export type TabBarPageScreenProps = BottomBarScrollScreenProps & TabBarPageProps

interface TabBarScreenProps {
  headerTitle: string
  pages: Array<(props: TabBarPageScreenProps) => ReactNode>
  tabLabels: string[]
  customHeaderContent?: ReactNode
  onTabChange?: (tabIndex: number) => void
}

const TabBarPager = ({
  pages,
  tabLabels,
  headerTitle,
  customHeaderContent,
  onTabChange,
  ...props
}: TabBarScreenProps) => {
  const tabBarRef = useAnimatedRef<Animated.View>()
  const [activeTab, setActiveTab] = useState(0)

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  const handleTabPress = (tabIndex: number) => {
    setActiveTab(tabIndex)
    if (onTabChange) onTabChange(tabIndex)
  }

  const TabBar = (
    <TabBarHeader
      tabLabels={tabLabels}
      activeTab={activeTab}
      onTabPress={handleTabPress}
      tabBarRef={tabBarRef}
      customContent={customHeaderContent}
    />
  )

  const ActivePage = pages[activeTab]

  return (
    <Screen>
      <BaseHeader options={{ headerTitle }} scrollY={screenScrollY} CustomContent={TabBar} isCentered={false} />
      <PageContainer>
        <Animated.View
          key={activeTab}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={StyleSheet.absoluteFillObject}
        >
          <WrappedPage Page={ActivePage} onScroll={screenScrollHandler} />
        </Animated.View>
      </PageContainer>
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

const PageContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.back2};
`
