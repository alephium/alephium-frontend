import { motion } from 'framer-motion'
import { Children } from 'react'
import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'

import { deviceBreakPoints } from '@/styles/globalStyles'

interface RowProps {
  isActive?: boolean
  highlight?: boolean
  isNew?: boolean
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
  linkTo?: string
  className?: string
}

const newRowFlash = keyframes`
  from {
    background-color: var(--new-row-flash-color);
  }
  to {
    background-color: transparent;
  }
`

const rowVariants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1 }
}

const TableRow: FC<RowProps> = ({ children, onClick, linkTo, className }) => (
  <motion.tr variants={rowVariants} transition={{ duration: 0.8 }} onMouseUp={onClick} className={className}>
    {Children.map(children, (c) =>
      // Let's not use the Children API anymore :)
      linkTo ? (
        <td style={{ padding: 0 }}>
          <FullHeightLink className="row-link" to={linkTo}>
            {c}
          </FullHeightLink>
        </td>
      ) : (
        <td>{c}</td>
      )
    )}
  </motion.tr>
)

export default styled(TableRow)`
  --new-row-flash-color: ${({ theme }) => theme.bg.accent};
  background-color: ${({ theme, isActive }) => (isActive ? theme.bg.primary : '')};
  border: none;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'auto')};

  ${({ isNew }) =>
    isNew &&
    css`
      @media (prefers-reduced-motion: no-preference) {
        animation: ${newRowFlash} 1.6s ease-out;
      }
    `}

  td:first-child {
    display: flex;
    align-items: center;
    min-height: 46px;
    font-weight: 600;
    color: ${({ theme, highlight }) => (highlight ? theme.font.primary : theme.font.secondary)};

    @media ${deviceBreakPoints.tablet} {
      display: initial;
      min-height: auto;
    }
  }

  td:first-child .row-link {
    padding-left: 12px;
  }

  td:nth-child(2) {
    color: ${({ theme }) => theme.font.primary};
  }
`

const FullHeightLink = styled(Link)`
  display: block;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  color: inherit;
  padding: 12px;

  &:hover {
    color: inherit;
  }
`
