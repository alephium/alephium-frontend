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
import styled, { css } from 'styled-components'

const SnackbarBox = styled(motion.div)`
  margin: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-3);
  color: ${({ theme }) => theme.font.primary};
  border-radius: var(--radius-big);
  min-width: 200px;
  max-width: 400px;
  word-wrap: break-word;
  overflow-y: auto;

  &.alert {
    ${({ theme }) => getSnackbarStyling(theme.global.alert)}
  }

  &.info {
    ${({ theme }) =>
      theme.name === 'light' ? getSnackbarStyling(theme.bg.contrast) : getSnackbarStyling(theme.bg.highlight)}
  }

  &.success {
    ${({ theme }) => getSnackbarStyling(theme.global.valid)}
  }
`

export default SnackbarBox

const getSnackbarStyling = (color: string) => css`
  background-color: ${color};
  border: 1px solid ${colord(color).lighten(0.05).toHex()};
  color: rgba(255, 255, 255, 0.8);
`
