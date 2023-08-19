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
import { BORDER_RADIUS, HORIZONTAL_MARGIN } from '~/style/globalStyle'

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
  const [activeTab, setActiveTab] = useState(tabs[0])

  const handleOnTabPress = (tab: Tab) => {
    setActiveTab(tab)
    navigation.navigate(tab.screen)
  }

  return (
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
      style={{ backgroundColor: isActive ? theme.bg.primary : 'transparent' }}
    >
      <ReanimatedText style={textStyle}>{label}</ReanimatedText>
    </PressableStyled>
  )
}

export default TopTabBar

const TabsRow = styled.View`
  flex-direction: row;
  gap: 20px;
`

const PressableStyled = styled(Pressable)`
  padding: 10px;
  border-radius: ${BORDER_RADIUS}px;
`

const ReanimatedText = styled(Reanimated.Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
`
