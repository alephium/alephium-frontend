import { useRef } from 'react'
import styled, { css } from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { deviceBreakPoints } from '@/styles/globalStyles'

import TableBody from './TableBody'
import TableRow from './TableRow'

interface TableProps {
  main?: boolean
  hasDetails?: boolean
  noBorder?: boolean
  bodyOnly?: boolean
  scrollable?: boolean
  isLoading?: boolean
  minHeight?: number
  className?: string
}

export interface TDStyle {
  tdPos: number
  style: ReturnType<typeof css>
}

const Table: FC<TableProps> = ({ children, isLoading, className, ...props }) => {
  const tableRef = useRef<HTMLDivElement>(null)

  return !isLoading ? (
    <TableWrapper {...props} className={className} ref={tableRef}>
      <StyledTable {...props}>{children}</StyledTable>
    </TableWrapper>
  ) : (
    <TableWrapper {...props} className={className} ref={tableRef}>
      <StyledTable {...props} minHeight={150}>
        {!props.bodyOnly && (
          <thead>
            <tr>
              <FakeTableHeader />
            </tr>
          </thead>
        )}
        <TableBody>
          {['l1', 'l2', 'l3'].map((v) => (
            <TableRow key={v}>
              <SkeletonLoader height="50px" />
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </TableWrapper>
  )
}

const TableWrapper = styled.div<TableProps>`
  background-color: ${({ theme }) => theme.bg.primary};
  border: ${({ noBorder, theme }) => !noBorder && `1px solid ${theme.border.primary}`};
  overflow: hidden;
  border-radius: 6px;
  line-height: initial;
  min-height: ${({ minHeight }) => minHeight}px;
`

const StyledTable = styled.table<TableProps>`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
  table-layout: fixed;
  white-space: nowrap;

  @media ${deviceBreakPoints.tablet} {
    ${({ scrollable, bodyOnly }) =>
      scrollable
        ? css`
            display: block;
            width: 100%;
            overflow-x: auto;
          `
        : bodyOnly
          ? /* Change table structure, stack td vertically */
            css`
              tr {
                display: flex;
                flex-direction: column;
                height: auto !important;

                td:first-child {
                  height: 25px !important;
                  font-weight: 600;
                }
                td:not(:first-child) {
                  height: initial !important;
                  font-weight: 500 !important;
                }
              }
            `
          : null}
  }

  tr td {
    padding: 8px;
  }

  tr:not(.details) {
    height: 46px;
  }

  th,
  td {
    ${({ bodyOnly }) =>
      bodyOnly &&
      css`
        width: 75%;
      `}

    @media ${deviceBreakPoints.tablet} {
      ${({ bodyOnly }) =>
        bodyOnly &&
        css`
          width: 100%;
        `}
    }

    &:first-child {
      padding-left: 12px;

      @media ${deviceBreakPoints.tablet} {
        padding-left: 12px;
      }

      ${({ bodyOnly }) =>
        bodyOnly &&
        css`
          width: 25%;
        `}
    }
  }

  svg {
    vertical-align: bottom;
  }

  tbody {
    tr:not(:last-child) {
      border-bottom: ${({ hasDetails, theme }) => (!hasDetails ? `1px solid ${theme.border.secondary}` : '')};
    }

    tr.details {
      &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
      }
      background-color: ${({ theme }) => theme.bg.hover};

      td {
        padding-top: 0;
        padding-bottom: 0;
      }

      table {
        td {
          padding-top: 10px;
          padding-bottom: 10px;
        }
      }
    }
  }
`

const FakeTableHeader = styled.th`
  height: 40px;
`

export default Table
