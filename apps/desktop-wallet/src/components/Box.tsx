import { motion } from 'framer-motion'
import styled, { css } from 'styled-components'

export interface BoxProps {
  hasBg?: boolean
  hasPadding?: boolean
}

const Box = styled(motion.div)<BoxProps>`
  border-radius: var(--radius-huge);
  width: 100%;

  ${({ hasBg }) =>
    hasBg &&
    css`
      background-color: ${({ theme }) => theme.bg.secondary};
    `}

  ${({ hasPadding }) =>
    hasPadding &&
    css`
      padding: var(--spacing-2);
    `}
`

export default Box
