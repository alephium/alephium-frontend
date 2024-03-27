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
import styled from 'styled-components'

export type DataListItem = {
  label: string
  value?: ReactNode
}

interface DataListProps {
  items: DataListItem[]
  title?: string
}

const DataList = ({ items, title }: DataListProps) => (
  <DataListStyled>
    {title && <DataListTitle>{title}</DataListTitle>}
    {items.map(({ label, value }) => (
      <DataRowStyled role="row" tabIndex={0}>
        <DetailsRowLabel tabIndex={0} role="cell">
          {label}
        </DetailsRowLabel>
        <ChildrenWrapper>{value || '-'}</ChildrenWrapper>
      </DataRowStyled>
    ))}
  </DataListStyled>
)

export default DataList

const DataListStyled = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: var(--radius-big);
  padding: 0 var(--spacing-4);
`

const DataListTitle = styled.h2`
  padding-top: var(--spacing-2);
`

const DataRowStyled = styled.div`
  padding: var(--spacing-4) 0;
  display: flex;
  gap: var(--spacing-3);
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const DetailsRowLabel = styled.div`
  font-weight: var(--fontWeight-medium);
  width: max(100px, 30%);
  color: ${({ theme }) => theme.font.secondary};
`

const ChildrenWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`
