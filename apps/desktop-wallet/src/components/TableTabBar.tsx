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
  font-size: 14px;
  height: 38px;
`
