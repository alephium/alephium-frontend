import { motion } from 'framer-motion'
import styled, { css } from 'styled-components'

export interface BoxProps {
  hasBg?: boolean
  hasVerticalPadding?: boolean
  hasHorizontalPadding?: boolean
  hasBorder?: boolean
  highlight?: boolean
}

const Box = styled(motion.div)<BoxProps>`
  border-radius: var(--radius-huge);
  width: 100%;

  ${({ hasBg }) =>
    hasBg &&
    css`
      background-color: ${({ theme }) => theme.bg.tertiary};
    `}

  ${({ hasVerticalPadding }) =>
    hasVerticalPadding &&
    css`
      padding-top: var(--spacing-2);
      padding-bottom: var(--spacing-2);
    `}

    ${({ hasHorizontalPadding }) =>
    hasHorizontalPadding &&
    css`
      padding-right: var(--spacing-2);
      padding-left: var(--spacing-2);
    `}

    ${({ hasBorder }) =>
    hasBorder &&
    css`
      border: 1px solid ${({ theme }) => theme.border.secondary};
    `}

    ${({ highlight }) =>
    highlight &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      background-color: ${({ theme }) => theme.bg.primary};
    `}
`

export default Box
