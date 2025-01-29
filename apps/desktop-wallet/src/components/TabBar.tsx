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
  justifyTabs?: 'left' | 'center'
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
  justifyTabs = 'center',
  className
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
  height: 46px;
  align-items: center;
`

const TabsContainer = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.bg.secondary};
  gap: 10px;
  padding: 4px;
  border-radius: 100px;
`

export const Tab = styled.div<{ isActive: boolean }>`
  display: flex;
  min-width: 50px;
  text-align: center;
  justify-content: center;
  align-items: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg.highlight : 'transparent')};
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.border.primary : 'transparent')};
  box-shadow: ${({ theme, isActive }) => (isActive ? theme.shadow.primary : undefined)};
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  border-radius: 100px;
  padding: 0 30px;
  height: calc(var(--inputHeight) - 2px);

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
    background-color: ${({ isActive, theme }) => (isActive ? theme.bg.primary : theme.bg.secondary)};
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
