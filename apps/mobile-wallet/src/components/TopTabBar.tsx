import { ReactNode, useState } from 'react'
import { LayoutChangeEvent, LayoutRectangle, PressableProps } from 'react-native'
import { PagerViewOnPageScrollEventData } from 'react-native-pager-view'
import Reanimated, {
  AnimatedRef,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { ImpactStyle, vibrate } from '~/utils/haptics'

type TabsLayout = Record<number, LayoutRectangle>

interface TopTabBarProps {
  tabLabels: string[]
  pagerScrollEvent: SharedValue<PagerViewOnPageScrollEventData>
  onTabPress: (index: number) => void
  tabBarRef?: AnimatedRef<Reanimated.View>
  customContent?: ReactNode
}

const indicatorXPadding = 10

const TopTabBar = ({ tabLabels, pagerScrollEvent, onTabPress, tabBarRef, customContent }: TopTabBarProps) => {
  const [tabLayouts, setTabLayouts] = useState<TabsLayout>({})

  const position = useDerivedValue(
    () => pagerScrollEvent.value.position + pagerScrollEvent.value.offset,
    [pagerScrollEvent.value]
  )

  const indicatorStyle = useAnimatedStyle(() => {
    const positionsArray = [...Array(tabLabels.length).keys()]
    const tabLayoutValues = Object.values(tabLayouts)
    if (tabLayoutValues.length !== positionsArray.length) return {}

    const x = interpolate(
      position.value,
      positionsArray,
      tabLayoutValues.map((l) => l.x)
    )

    const width = interpolate(
      position.value,
      positionsArray,
      tabLayoutValues.map((l) => l.width)
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
    setTabLayouts((prevLayouts) => ({
      ...prevLayouts,
      [tabIndex]: e.nativeEvent.layout
    }))
  }

  return (
    <TopTabBarStyled>
      {customContent}
      <HeaderContainer ref={tabBarRef}>
        <Indicator style={indicatorStyle} />
        {tabLabels.map((label, i) => (
          <TabBarItem
            key={label}
            index={i}
            label={label}
            position={position}
            onPress={() => handleOnTabPress(i)}
            onLayout={(e) => handleTabLayoutEvent(i, e)}
          />
        ))}
      </HeaderContainer>
    </TopTabBarStyled>
  )
}

const AnimatedAppText = Reanimated.createAnimatedComponent(AppText)

interface TabBarItemProps extends PressableProps {
  label: string
  index: number
  position: SharedValue<number>
}

const TabBarItem = ({ label, index, position, ...props }: TabBarItemProps) => {
  const theme = useTheme()

  const animatedTextStyle = useAnimatedStyle(() => {
    const diff = position.value - index
    return {
      color: interpolateColor(diff, [-1, 0, 1], [theme.font.primary, theme.global.accent, theme.font.primary])
    }
  })

  return (
    <TabBarItemStyled {...props}>
      <AnimatedAppText style={animatedTextStyle} size={15}>
        {label}
      </AnimatedAppText>
    </TabBarItemStyled>
  )
}

export default TopTabBar

const TopTabBarStyled = styled.View`
  width: 100%;
  flex-direction: column;
  gap: 10px;
`

const HeaderContainer = styled(Reanimated.View)`
  flex-direction: row;
  gap: 25px;
  align-items: center;
  justify-content: flex-start;
  height: 44px;
  padding-left: ${indicatorXPadding}px;
`

const TabBarItemStyled = styled.Pressable`
  height: 100%;
  justify-content: center;
  align-items: center;
`

const Indicator = styled(Reanimated.View)`
  position: absolute;
  height: 80%;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.accent};
`
