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
import styled, { css } from 'styled-components'

import { deviceBreakPoints } from '@/styles/globalStyles'

import LoadingSpinner from '../LoadingSpinner'

export interface TabItem {
  value: string
  label: string | ReactNode
  icon?: ReactNode
  highlightColor?: string
  length?: number
  loading?: boolean
}

interface TableTabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  className?: string
}

const TableTabBar = ({ items, onTabChange, activeTab, className }: TableTabBarProps) => (
  <div className={className} role="tablist" aria-label="Tab navigation">
    {items.map((item) => {
      const isActive = activeTab.value === item.value

      return (
        <Tab
          key={item.value}
          onClick={() => onTabChange(item)}
          onKeyPress={() => onTabChange(item)}
          isAlone={items.length === 1}
          role="tab"
          tabIndex={0}
          aria-selected={isActive}
          isActive={isActive}
        >
          {item.icon && (
            <IconWrapper style={isActive && item.highlightColor ? { color: item.highlightColor } : undefined}>
              {item.icon}
            </IconWrapper>
          )}
          <LabelWrapper>{item.label}</LabelWrapper>
          {!item.loading && <NumberOfItems>{`${item.length}`}</NumberOfItems>}
          {item.loading && <LoadingSpinner style={{ marginLeft: 4 }} size={18} />}
        </Tab>
      )
    })}
  </div>
)

export default styled(TableTabBar)`
  display: flex;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-radius: 9px 9px 0 0;
  overflow: hidden;
`

const Tab = styled.div<{ isActive: boolean; isAlone: boolean }>`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  height: 50px;
  cursor: pointer;

  ${({ isAlone }) =>
    isAlone &&
    css`
      justify-content: left;
      padding: 25px;
      cursor: default;
    `}

  @media ${deviceBreakPoints.mobile} {
    font-size: 13px;
  }

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.border.primary};
  }

  ${({ isActive, theme }) =>
    isActive
      ? css`
          background-color: ${theme.bg.secondary};
          border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
        `
      : css`
          background-color: ${theme.bg.tertiary};
          border-bottom: 1px solid ${({ theme }) => theme.border.primary};
        `}

  opacity: ${({ isActive }) => (isActive ? 1 : 0.6)};

  &:hover {
    opacity: 1;
  }
`

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;

  @media ${deviceBreakPoints.mobile} {
    margin-right: 3px;
  }
`

const LabelWrapper = styled.span``

const NumberOfItems = styled.div`
  display: inline;
  margin-left: 8px;
  margin-top: 1px;
  padding: 1px 5px;
  background-color: ${({ theme }) => theme.bg.background2};
  color: ${({ theme }) => theme.font.secondary};
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  font-size: 11px;
`
