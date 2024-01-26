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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface TableHeaderProps {
  headerTitles: ReactNode[]
  columnWidths?: string[]
  textAlign?: ('left' | 'right' | 'center')[]
  compact?: boolean
  transparent?: boolean
  className?: string
}

export const TableHeader = ({ headerTitles, columnWidths, textAlign, className }: TableHeaderProps) => {
  const { t } = useTranslation()
  return (
    <thead className={className}>
      <tr>
        {headerTitles.map((v, i) => (
          <th
            key={i}
            style={{
              width: columnWidths ? columnWidths[i] || 'auto' : 'auto',
              textAlign: textAlign ? textAlign[i] : 'left'
            }}
          >
            {typeof v === 'string' ? t(v) : v}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default styled(TableHeader)`
  color: ${({ theme }) => theme.font.secondary};

  background-color: ${({ theme, transparent }) => (transparent ? 'transparent' : `${theme.bg.tertiary}`)};

  tr {
    height: ${({ compact }) => (compact ? '30px' : '50px')} !important;
  }

  th {
    padding: 12px;
    font-family: 'Inter';
    font-weight: 600;
    font-size: 13px;

    position: sticky;
    top: 0;
    box-shadow: inset 0 -1px 0 ${({ theme }) => theme.border.primary};
  }
`
