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
  height: calc(var(--inputHeight) - 4px);
`
