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

import { ChevronRight, LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'

export interface TabItem<T extends string> {
  value: T
  label: string
  Icon?: LucideIcon
}

export interface TabBarProps<T extends string> {
  items: TabItem<T>[]
  onTabChange: (tab: TabItem<T>) => void
  activeTab: TabItem<T>
  linkText?: string
  onLinkClick?: () => void
  TabComponent?: typeof Tab
  className?: string
}

const TabBar = <T extends string>({
  items,
  onTabChange,
  activeTab,
  linkText,
  onLinkClick,
  TabComponent = Tab,
  className
}: TabBarProps<T>) => {
  const { t } = useTranslation()

  return (
    <TabBarStyled className={className} role="tablist" aria-label={t('Tab navigation')}>
      {items.map((item) => {
        const isActive = activeTab.value === item.value

        return (
          <TabComponent
            key={item.value}
            onClick={() => onTabChange(item)}
            onKeyDown={() => onTabChange(item)}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            isActive={isActive}
          >
            <TabLabel isActive={isActive}>
              {item.Icon && (
                <TabIcon>
                  <item.Icon />
                </TabIcon>
              )}
              {item.label}
            </TabLabel>
          </TabComponent>
        )
      })}
      {linkText && onLinkClick && (
        <ActionLinkStyled onClick={onLinkClick} Icon={ChevronRight}>
          {linkText}
        </ActionLinkStyled>
      )}
    </TabBarStyled>
  )
}

export default TabBar

const TabBarStyled = styled.div`
  display: flex;
  height: 48px;
  gap: 10px;
`

export const Tab = styled.div<{ isActive: boolean }>`
  display: flex;
  min-width: 50px;
  text-align: center;
  justify-content: center;
  align-items: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg.accent : theme.bg.primary)};
  cursor: pointer;
  font-size: 15px;
  font-weight: var(--fontWeight-medium);
  border-radius: 100px;
  padding: 0 30px;
  height: calc(var(--inputHeight) - 2px);

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.global.accent};
        `
      : css`
          color: ${theme.font.tertiary};
        `}

  &:hover {
    color: ${({ isActive, theme }) => (isActive ? theme.font.contrastPrimary : theme.font.primary)};
    background-color: ${({ isActive, theme }) => (isActive ? theme.global.accent : theme.bg.highlight)};
  }
`

const TabLabel = styled.span<{ isActive: boolean }>`
  display: flex;
  align-items: center;

  ${({ isActive }) =>
    !isActive &&
    css`
      filter: saturate(10%);
    `}
`

const TabIcon = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
`

const ActionLinkStyled = styled(ActionLink)`
  margin-left: auto;
  margin-right: 20px;
`
