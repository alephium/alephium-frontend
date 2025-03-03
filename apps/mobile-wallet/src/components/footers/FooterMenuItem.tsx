import { BottomTabNavigationEventMap, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { NavigationHelpers, ParamListBase } from '@react-navigation/native'
import { TouchableWithoutFeedback } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface FooterMenuItemProps {
  options: BottomTabNavigationOptions
  isFocused: boolean
  routeName: string
  target: string
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>
}

const FooterMenuItem = ({ options, isFocused, routeName, target, navigation }: FooterMenuItemProps) => {
  const theme = useTheme()

  const Icon =
    options.tabBarIcon &&
    options.tabBarIcon({
      focused: isFocused,
      color: isFocused ? theme.font.primary : theme.font.tertiary,
      size: 24
    })

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target,
      canPreventDefault: true
    })

    vibrate(ImpactStyle.Medium)

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={onPress} key={routeName}>
      <Tab active={isFocused}>{Icon}</Tab>
    </TouchableWithoutFeedback>
  )
}

export default FooterMenuItem

const Tab = styled.View<{ active: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS * 0.7}px;
  padding: 4px 8px;
`
