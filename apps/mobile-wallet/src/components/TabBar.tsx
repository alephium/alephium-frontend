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

import { ReactNode } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

export interface TabItem {
  value: string
  label: ReactNode
}

export interface TabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  style?: StyleProp<ViewStyle>
}

const TabBar = ({ items, onTabChange, activeTab, style }: TabBarProps) => {
  const theme = useTheme()

  const handleTabChange = (item: TabItem) => {
    vibrate(ImpactStyle.Medium)
    onTabChange(item)
  }

  return (
    <TabBarStyled style={style}>
      {items.map((item) => {
        const isActive = activeTab.value === item.value

        return (
          <Pressable key={item.value} onPress={() => handleTabChange(item)}>
            <Tab
              isActive={isActive}
              style={{
                shadowColor: isActive ? 'black' : 'transparent',
                shadowOffset: { height: 3, width: 0 },
                shadowOpacity: theme.name === 'dark' ? 0 : 0.08,
                shadowRadius: 5,
                elevation: isActive ? 10 : 0
              }}
            >
              {typeof item.label === 'string' ? (
                <AppText semiBold size={16} color={isActive ? theme.font.primary : theme.font.tertiary}>
                  {item.label}
                </AppText>
              ) : (
                item.label
              )}
            </Tab>
          </Pressable>
        )
      })}
    </TabBarStyled>
  )
}

export default TabBar

const TabBarStyled = styled.View`
  flex-direction: row;
  gap: 20px;
`

export const Tab = styled.View<{ isActive: boolean }>`
  text-align: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  background-color: ${({ isActive, theme }) =>
    isActive ? (theme.name === 'light' ? theme.bg.highlight : theme.button.primary) : 'transparent'};
  padding: 8px 10px;
  border-radius: ${BORDER_RADIUS}px;
  margin-bottom: -1px;
`
