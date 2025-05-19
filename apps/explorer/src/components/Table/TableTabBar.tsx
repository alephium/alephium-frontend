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
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`

const Tab = styled.div<{ isActive: boolean; isAlone: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  margin: 10px;
  border-radius: 8px;
  height: 38px;
  cursor: pointer;
  padding: 0 10px;

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

  ${({ isActive, theme }) =>
    isActive
      ? css`
          background-color: ${theme.bg.secondary};
          box-shadow: inset 0 0 0 1px ${theme.border.primary};
        `
      : css`
          background-color: ${theme.bg.primary};
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
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  font-size: 11px;
`
