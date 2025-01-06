import styled, { css } from 'styled-components'

import TabBar, { Tab, TabBarProps } from '@/components/TabBar'

const TableTabBar = <T extends string>(props: TabBarProps<T>) => (
  <TableTabBarStyled {...props} TabComponent={TableTab} />
)

export default TableTabBar

const TableTabBarStyled = styled(TabBar)`
  background-color: ${({ theme }) => theme.bg.secondary};
` as typeof TabBar

const TableTab = styled(Tab)`
  min-width: 60px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg.primary : theme.bg.tertiary)};
  border: none;

  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  margin-bottom: 0;

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-bottom: 1px solid transparent;
    `}

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:first-child,
  &:last-child {
    border-radius: 0;
  }
`
