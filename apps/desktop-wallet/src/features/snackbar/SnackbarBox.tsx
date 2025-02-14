import { colord } from 'colord'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

interface SnackbarBoxProps {
  className?: string
  children: ReactNode
}

const SnackbarBox = ({ children, ...props }: SnackbarBoxProps) => (
  <SnackBarBoxContainer {...props}>
    <BlurredBackground />
    <SnackbarBoxContent>{children}</SnackbarBoxContent>
  </SnackBarBoxContainer>
)

const SnackbarBoxContent = styled(motion.div)`
  font-size: 13px;
  color: ${({ theme }) => theme.font.primary};
  word-wrap: break-word;
  overflow-y: auto;
  font-weight: var(--fontWeight-semiBold);
  pointer-events: all;
  margin-top: -10px;
  background-color: ${({ theme }) => theme.bg.highlight};
  z-index: 1;
  padding: 10px 20px;
  border-radius: var(--radius-medium);
`

const BlurredBackground = styled.div`
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0 0 100% 100%;
  filter: blur(30px);
  pointer-events: none;
  transform: scaleX(1.2);
  z-index: 0;
  background: linear-gradient(to bottom, ${({ theme }) => theme.bg.background2} 80%, transparent 100%);
`

const SnackBarBoxContainer = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 200px;
  max-width: 1200px;
  width: 80%;
  height: 80px;

  &.alert {
    ${({ theme }) => getSnackbarStyling(theme.global.alert)}
  }

  &.info {
    ${({ theme }) => getSnackbarStyling(theme.global.accent)}
  }

  &.success {
    ${({ theme }) => getSnackbarStyling(theme.global.valid)}
  }
`

export default SnackbarBox

const getSnackbarStyling = (color: string) => css`
  ${SnackbarBoxContent} {
    font-size: 14px;
    background-color: ${({ theme }) => colord(color).alpha(0.1).toHex()};
    border: 1px solid
      ${({ theme }) =>
        theme.name === 'light' ? colord(color).alpha(0.1).toHex() : colord(color).alpha(0.2).lighten(0.1).toHex()};
    color: ${({ theme }) =>
      theme.name === 'light' ? colord(color).toHex() : colord(color).alpha(1).lighten(0.1).toHex()};
  }
`
