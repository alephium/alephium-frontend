import styled from 'styled-components'

import TabBar, { Tab, TabBarProps } from '@/components/TabBar'

const TableTabBar = <T extends string>(props: TabBarProps<T>) => (
  <TableTabBarStyled {...props} TabComponent={TableTab} />
)

export default TableTabBar

const TableTabBarStyled = styled(TabBar)`
  height: 50px;
  gap: 10px;
  margin-bottom: var(--spacing-2);
` as typeof TabBar

const TableTab = styled(Tab)`
  min-width: 60px;
  overflow: hidden;
  font-size: 13px;
  height: calc(var(--inputHeight) - 4px);
  box-shadow: ${({ theme, isActive }) => (isActive ? theme.shadow.primary : 'none')};
`
