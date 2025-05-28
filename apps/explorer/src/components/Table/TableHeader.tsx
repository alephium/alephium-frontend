import { ReactNode } from 'react'
import styled from 'styled-components'

interface TableHeaderProps {
  headerTitles: ReactNode[]
  columnWidths?: string[]
  textAlign?: ('left' | 'right' | 'center')[]
  compact?: boolean
  transparent?: boolean
  className?: string
}

export const TableHeader = ({ headerTitles, columnWidths, textAlign, className }: TableHeaderProps) => (
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
          {typeof v === 'string' ? v : v}
        </th>
      ))}
    </tr>
  </thead>
)

export default styled(TableHeader)`
  color: ${({ theme }) => theme.font.secondary};

  background-color: ${({ theme, transparent }) => (transparent ? 'transparent' : `${theme.bg.secondary}`)};

  tr {
    height: ${({ compact }) => (compact ? '34px' : '40px')} !important;
  }

  th {
    padding: 0 10px;
    font-weight: 600;
    font-size: 13px;
    position: sticky;
    top: 0;
  }
`
