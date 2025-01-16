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
