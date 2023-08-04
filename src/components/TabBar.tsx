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

import { Pressable, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

export interface TabItem {
  value: string
  label: string
}

export interface TabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  style?: StyleProp<ViewStyle>
}

const TabBar = ({ items, onTabChange, activeTab, style }: TabBarProps) => {
  const theme = useTheme()

  return (
    <TabBarStyled style={style}>
      {items.map((item) => {
        const isActive = activeTab.value === item.value

        return (
          <Pressable key={item.value} onPress={() => onTabChange(item)}>
            <Tab isActive={isActive}>
              <AppText semiBold size={18} color={isActive ? theme.font.primary : theme.font.tertiary}>
                {item.label}
              </AppText>
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
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.secondary};
  padding: 0 20px;
`

export const Tab = styled.View<{ isActive: boolean }>`
  flex: 1;
  text-align: center;
  justify-content: center;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${({ isActive, theme }) => (isActive ? theme.font.primary : 'transparent')};
  padding: 13px 0;
  margin-bottom: -1px;
`
