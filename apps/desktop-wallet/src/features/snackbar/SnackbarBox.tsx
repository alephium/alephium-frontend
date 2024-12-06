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
  font-size: 14px;
  color: ${({ theme }) => theme.font.primary};
  word-wrap: break-word;
  overflow-y: auto;
  font-weight: var(--fontWeight-semiBold);
  z-index: 1;
  pointer-events: all;
  margin-top: -10px;
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
  ${BlurredBackground} {
    background: linear-gradient(to bottom, ${color} 0%, transparent 80%);
  }

  ${SnackbarBoxContent} {
    color: ${({ theme }) =>
      theme.name === 'light' ? colord(color).darken(0.1).toHex() : colord(color).lighten(0.3).toHex()};
  }
`
