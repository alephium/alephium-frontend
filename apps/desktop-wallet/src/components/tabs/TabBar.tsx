import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import { TabItem } from '@/components/tabs/tabsTypes'

export interface TabBarProps<T extends string> {
  items: TabItem<T>[]
  onTabChange: (tab: TabItem<T>) => void
  activeTab: TabItem<T>
  linkText?: string
  onLinkClick?: () => void
  justifyTabs?: 'left' | 'center'
  TabComponent?: typeof Tab
  className?: string
  onMouseEnterTab?: (tabValue: T) => void
  onMouseLeaveTab?: (tabValue: T) => void
}

const TabBar = <T extends string>({
  items,
  onTabChange,
  activeTab,
  linkText,
  onLinkClick,
  TabComponent = Tab,
  justifyTabs = 'center',
  className,
  onMouseEnterTab,
  onMouseLeaveTab
}: TabBarProps<T>) => {
  const { t } = useTranslation()

  return (
    <TabBarStyled
      className={className}
      role="tablist"
      aria-label={t('Tab navigation')}
      style={{ justifyContent: justifyTabs }}
    >
      <TabsContainer>
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
              onMouseEnter={() => onMouseEnterTab?.(item.value)}
              onMouseLeave={() => onMouseLeaveTab?.(item.value)}
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
      </TabsContainer>
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
  align-items: center;
  margin-bottom: 10px;
`

const TabsContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 30px;
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`

export const Tab = styled(motion.div)<{ isActive: boolean }>`
  display: flex;
  text-align: center;
  cursor: pointer;
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
  height: 38px;
  box-shadow: 0 1px 0 ${({ theme, isActive }) => (isActive ? theme.bg.contrast : 'transparent')};

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.font.primary};
        `
      : css`
          color: ${theme.font.tertiary};
        `}

  &:hover {
    color: ${({ isActive, theme }) => (isActive ? theme.font.primary : theme.font.primary)};
  }
  z-index: 1;
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
