import { ReactNode } from 'react'
import { PressableProps } from 'react-native'
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

interface TopTabBarProps {
  tabLabels: string[]
  pagerScrollEvent: SharedValue<PagerViewOnPageScrollEventData>
  onTabPress: (index: number) => void
  tabBarRef?: AnimatedRef<Reanimated.View>
  customContent?: ReactNode
}

const TopTabBar = ({ tabLabels, pagerScrollEvent, onTabPress, tabBarRef, customContent }: TopTabBarProps) => {
  const position = useDerivedValue(
    () => pagerScrollEvent.value.position + pagerScrollEvent.value.offset,
    [pagerScrollEvent.value]
  )

  const handleOnTabPress = (tabIndex: number) => {
    vibrate(ImpactStyle.Medium)
    onTabPress(tabIndex)
  }

  return (
    <TopTabBarStyled>
      {customContent}
      <HeaderContainer ref={tabBarRef}>
        {tabLabels.map((label, i) => (
          <TabBarItem key={label} index={i} label={label} position={position} onPress={() => handleOnTabPress(i)} />
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
      color: interpolateColor(diff, [-1, 0, 1], [theme.font.tertiary, theme.font.primary, theme.font.tertiary]),
      transform: [{ scale: interpolate(diff, [-1, 0, 1], [1, 1.05, 1]) }]
    }
  })

  return (
    <TabBarItemStyled {...props}>
      <AnimatedAppText style={[animatedTextStyle, { transformOrigin: '0% 50%' }]} size={19} semiBold>
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
  gap: 30px;
  align-items: center;
  justify-content: flex-start;
  height: 40px;
`

const TabBarItemStyled = styled.Pressable`
  height: 100%;
  justify-content: center;
  align-items: center;
  transform-origin: left;
`
