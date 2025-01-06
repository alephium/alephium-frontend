import { colord } from 'colord'
import { motion } from 'framer-motion'
import styled, { css } from 'styled-components'

const SnackbarBox = styled(motion.div)`
  margin: var(--spacing-3);
  min-width: 200px;
  padding: var(--spacing-4) var(--spacing-3);
  color: ${({ theme }) => theme.font.primary};
  border-radius: var(--radius-big);
  max-width: 800px;
  word-wrap: break-word;
  overflow-y: auto;

  &.alert {
    ${({ theme }) => getSnackbarStyling(theme.global.alert)}
  }

  &.info {
    ${({ theme }) =>
      theme.name === 'light' ? getSnackbarStyling(theme.bg.contrast) : getSnackbarStyling(theme.bg.background2)}
  }

  &.success {
    ${({ theme }) => getSnackbarStyling(theme.global.valid)}
  }
`

export default SnackbarBox

const getSnackbarStyling = (color: string) => css`
  background-color: ${color};
  border: 1px solid ${colord(color).lighten(0.1).toHex()};
  color: rgba(255, 255, 255, 0.8);
`
