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

interface TableCellProps {
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
  overflow: auto;

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
  padding: 16px 0;
  min-width: ${({ fixedWidth }) =>
    fixedWidth ? (typeof fixedWidth === 'number' ? `${fixedWidth}px` : fixedWidth) : 'auto'};
  min-height: 60px;
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
  min-height: var(--inputHeight);

  ${({ onClick }) =>
    onClick &&
    css`
      &:hover {
        cursor: pointer;
        background-color: ${({ theme }) => theme.bg.hover};
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
  height: 40px;
  color: ${({ theme }) => theme.font.tertiary};

  ${TableCell} {
    min-height: 48px;
  }
`

const TableTitle = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
`

export const ExpandRow = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <ExpandRowStyled>
      <Button role="secondary" onClick={onClick} Icon={ChevronsUpDown} short rounded>
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

export const ExpandableTable = styled(Table)<{ isExpanded: boolean; maxHeightInPx?: number }>`
  max-height: ${({ maxHeightInPx }) => maxHeightInPx && maxHeightInPx}px;
  overflow: hidden;
  position: relative;
  height: 100%;

  ${({ isExpanded }) =>
    isExpanded &&
    css`
      max-height: none;
    `}

  &:hover {
    ${ExpandRowStyled} {
      opacity: 1;
      z-index: 3; // Make sure it is displayed above copy btns
    }
  }
`
