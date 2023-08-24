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

import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { useState } from 'react'
import { Pressable } from 'react-native'
import Reanimated, { Extrapolate, interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import { useScrollContext } from '~/contexts/ScrollContext'

const scrollRange = [0, 50]

type Tab = {
  label: string
  screen: string
}

const tabs: Tab[] = [
  {
    label: 'Addresses',
    screen: 'AddressesScreen'
  },
  {
    label: 'Contacts',
    screen: 'ContactsScreen'
  }
]

const TopTabBar = ({ navigation }: BottomTabHeaderProps) => {
  const { scrollY, scrollToTop } = useScrollContext()
  const theme = useTheme()

  const [activeTab, setActiveTab] = useState(tabs[0])

  const bgColorRange = [theme.bg.primary, theme.bg.secondary]
  const borderColorRange = ['transparent', theme.border.secondary]
  const insets = useSafeAreaInsets()

  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY?.value || 0, scrollRange, bgColorRange),
    borderColor: interpolateColor(scrollY?.value || 0, scrollRange, borderColorRange)
  }))

  const handleOnTabPress = (tab: Tab) => {
    setActiveTab(tab)
    navigation.navigate(tab.screen)
  }

  return (
    <Pressable onPress={() => scrollToTop && scrollToTop()}>
      <Reanimated.View style={[headerStyle, { paddingTop: insets.top }]}>
        <TabsRow>
          {tabs.map((tab) => (
            <TabBarItem
              key={tab.label}
              isActive={activeTab.label === tab.label}
              label={tab.label}
              navigation={navigation}
              onPress={() => handleOnTabPress(tab)}
            />
          ))}
        </TabsRow>
      </Reanimated.View>
    </Pressable>
  )
}

interface TabBarItemProps {
  label: string
  navigation: BottomTabHeaderProps['navigation']
  onPress: () => void
  isActive: boolean
}

const TabBarItem = ({ label, isActive, onPress }: TabBarItemProps) => {
  const { scrollY } = useScrollContext()
  const theme = useTheme()

  const textStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY?.value || 0, scrollRange, [28, 18], Extrapolate.CLAMP),
    opacity: isActive ? 1 : 0.3
  }))

  return (
    <PressableStyled
      key={label}
      accessibilityRole="button"
      onPress={onPress}
      style={{ borderColor: isActive ? theme.font.primary : 'transparent' }}
    >
      <ReanimatedText style={textStyle}>{label}</ReanimatedText>
    </PressableStyled>
  )
}

export default TopTabBar

const TabsRow = styled.View`
  flex-direction: row;
  gap: 20px;
  border-bottom-color: ${({ theme }) => theme.border.secondary};
  border-bottom-width: 1px;
  padding: 0 20px;
`

const PressableStyled = styled(Pressable)`
  border-bottom-width: 1px;
  margin-bottom: -1px;
`

const ReanimatedText = styled(Reanimated.Text)`
  padding: 18px 0;
  font-weight: 600;
`
