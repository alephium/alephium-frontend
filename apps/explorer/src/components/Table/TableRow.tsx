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
import { Children } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface RowProps {
  isActive?: boolean
  onClick?: React.MouseEventHandler<HTMLTableRowElement>
  linkTo?: string
  className?: string
}

const rowVariants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1 }
}

const TableRow: FC<RowProps> = ({ children, onClick, linkTo, className }) => (
  <motion.tr variants={rowVariants} transition={{ duration: 0.8 }} onMouseUp={onClick} className={className}>
    {Children.map(children, (c) =>
      // TODO: Don't use the children API. Refactor tables entierly, using flexbox / grid / a library.
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
  background-color: ${({ theme, isActive }) => (isActive ? theme.bg.hover : '')};
  border: none;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'auto')};

  td:first-child .row-link {
    padding-left: 20px;
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
