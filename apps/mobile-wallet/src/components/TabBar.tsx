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
                backgroundColor: isActive ? theme.button.secondary : 'transparent'
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
  justify-content: center;
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
