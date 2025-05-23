import { motion } from 'framer-motion'
import { ChevronsUpDown } from 'lucide-react'
import { HTMLProps } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Button from '@/components/Button'

export interface TableProps {
  minWidth?: string
  className?: string
}

export interface TableCellProps {
  fixedWidth?: number | string
  noBorder?: boolean
  align?: 'left' | 'center' | 'right'
}

const Table: FC<TableProps> = ({ className, children, minWidth }) => (
  <TableWrapper className={className} minWidth={minWidth}>
    <div role="table" tabIndex={0}>
      {children}
    </div>
  </TableWrapper>
)

export default Table

const TableWrapper = styled(motion.div)<Pick<TableProps, 'minWidth'>>`
  width: 100%;

  ${({ minWidth }) =>
    minWidth &&
    css`
      min-width: ${minWidth};
    `}
`

export const TableCell = styled.div<TableCellProps>`
  display: flex;
  flex: ${({ fixedWidth }) => (fixedWidth ? '0' : '1')};
  align-items: center;
  justify-content: ${({ align }) => (align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start')};
  position: relative;
  border-bottom: ${({ theme, noBorder }) => `1px solid ${noBorder ? 'transparent' : theme.border.secondary}`};
  padding: 10px 0;
  min-width: ${({ fixedWidth }) =>
    fixedWidth ? (typeof fixedWidth === 'number' ? `${fixedWidth}px` : fixedWidth) : 'auto'};
  min-height: 52px;
  overflow: hidden;
  text-overflow: ellipsis;
`

interface TableColumnsProps extends Omit<HTMLProps<HTMLDivElement>, 'ref'> {
  columnWidths?: (string | undefined)[]
}

const TableColumns = styled.div<TableColumnsProps>`
  display: flex;
`

export interface TableRowProps extends TableColumnsProps {
  blinking?: boolean
}

export const TableRow = styled(TableColumns)<TableRowProps>`
  position: relative;
  z-index: 0;

  min-height: var(--inputHeight);

  ${({ onClick, theme }) =>
    onClick &&
    css`
      &:hover {
        cursor: pointer;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -8px;
          right: -8px;

          border-radius: var(--radius-big);
          background-color: ${theme.bg.hover};
          z-index: -1;
        }
      }
    `}

  ${({ blinking }) =>
    blinking &&
    css`
      opacity: 0.5;
      background: linear-gradient(90deg, rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.05));
      background-size: 400% 400%;
      animation: gradient 2s ease infinite;

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        25% {
          background-position: 100% 50%;
        }
        75% {
          background-position: 25% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `}

  &:last-child {
    ${TableCell} {
      border-bottom: none;
    }
  }
`

export const TableFooter = styled(TableColumns)``

export const TableCellPlaceholder = styled(TableCell)`
  color: ${({ theme }) => theme.font.tertiary};
  align-self: center;
  justify-self: center;
`

interface TableHeaderProps extends TableRowProps {
  title?: string
}

export const TableHeader = ({ title, children, className }: TableHeaderProps) => (
  <TableHeaderRow className={className}>
    {title && <TableTitle>{title}</TableTitle>}
    {children}
  </TableHeaderRow>
)

const TableHeaderRow = styled(TableRow)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: ${({ theme }) => theme.font.tertiary};

  ${TableCell} {
    min-height: 48px;
    border: none;
  }
`

const TableTitle = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
`

export const ExpandRow = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <ExpandRowStyled>
      <Button role="secondary" onClick={onClick} Icon={ChevronsUpDown} short>
        {t('Expand')}
      </Button>
    </ExpandRowStyled>
  )
}

const ExpandRowStyled = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  bottom: 0;
  height: 70px;
  display: flex;
  align-items: flex-end;

  opacity: 0.8;
  transition: opacity 0.15s ease-out;

  pointer-events: none;

  ${({ theme }) => {
    const gradientMaxOpacity = theme.name === 'light' ? 0.02 : 0.25

    return css`
      background: linear-gradient(0deg, rgba(0, 0, 0, ${gradientMaxOpacity}) 0%, rgba(0, 0, 0, 0) 100%);
    `
  }}
`
