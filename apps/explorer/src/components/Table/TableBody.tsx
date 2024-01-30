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
import styled, { css } from 'styled-components'

import { TDStyle } from './Table'

interface TableBodyProps {
  tdStyles?: TDStyle[]
  className?: string
}

const bodyVariants = {
  hidden: { opacity: 0 },
  shown: {
    opacity: 1,
    transition: {
      staggerChildren: 0.015
    }
  }
}

const TableBody: FC<TableBodyProps> = ({ className, children }) => (
  <motion.tbody className={className} variants={bodyVariants} initial="hidden" animate="shown">
    {children}
  </motion.tbody>
)

export default styled(TableBody)`
  color: ${({ theme }) => theme.font.primary};

  & > tr {
    ${({ tdStyles }) =>
      tdStyles
        ? tdStyles.map(
            (s) => css`
              & > td:nth-child(${s.tdPos}) {
                ${s.style}
              }
            `
          )
        : ''}

    &.details table tr:hover {
      background-color: inherit;
    }

    &.details > td > div {
      overflow: hidden;
    }

    &:hover {
      background-color: ${({ theme }) => theme.bg.hover};
    }
  }
`
