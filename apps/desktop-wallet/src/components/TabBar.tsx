import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'

export interface TabItem<T extends string> {
  value: T
  label: string
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
            <TabLabel isActive={isActive}>{item.label}</TabLabel>
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
  height: 55px;
`

export const Tab = styled.div<{ isActive: boolean }>`
  flex: 1;
  display: flex;
  min-width: 50px;
  text-align: center;
  justify-content: center;
  align-items: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg.background1 : 'transparent')};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-bottom: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: -1px;

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.font.primary};
        `
      : css`
          color: ${theme.font.tertiary};
        `}

  &:not(:first-child) {
    border-left: none;
  }

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const TabLabel = styled.span<{ isActive: boolean }>`
  ${({ isActive }) =>
    !isActive &&
    css`
      filter: saturate(10%);
    `}
`

const ActionLinkStyled = styled(ActionLink)`
  margin-left: auto;
  margin-right: 20px;
`
