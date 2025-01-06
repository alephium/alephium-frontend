import { motion } from 'framer-motion'
import styled from 'styled-components'

import { deviceBreakPoints } from '@/styles/globalStyles'

import { SnackbarMessage } from './SnackbarProvider'

const Snackbar = ({ text, Icon, type }: SnackbarMessage) => (
  <SnackbarStyled className={type || 'info'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {Icon}
    {text}
  </SnackbarStyled>
)

export default Snackbar

const SnackbarStyled = styled(motion.div)`
  text-align: center;
  min-width: 150px;
  max-width: 50vw;
  padding: 20px;
  color: white;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  box-shadow: ${({ theme }) => theme.shadow.secondary};

  display: flex;
  gap: 10px;
  align-items: center;

  &.alert {
    background-color: rgb(219, 99, 69);
  }

  &.info {
    background-color: black;
  }

  &.success {
    background-color: rgb(56, 168, 93);
  }

  @media ${deviceBreakPoints.mobile} {
    margin: 10px auto;
    max-width: 90vw;
  }
`
