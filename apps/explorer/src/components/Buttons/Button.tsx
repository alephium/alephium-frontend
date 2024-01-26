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
import { HTMLMotionProps, motion } from 'framer-motion'
import styled, { useTheme } from 'styled-components'

interface ButtonProps extends HTMLMotionProps<'button'> {
  accent?: boolean
  big?: boolean
}

const Button = ({ accent, big, ...props }: ButtonProps) => {
  const theme = useTheme()

  const bgColor = accent ? theme.global.accent : theme.bg.primary

  return (
    <motion.button
      {...props}
      style={{
        height: big ? '50px' : 'intial',
        minWidth: big ? '250px' : 'initial'
      }}
      initial={{ backgroundColor: bgColor }}
      animate={{
        backgroundColor: bgColor,
        color: accent ? '#ffffff' : theme.font.primary
      }}
      whileHover={{
        backgroundColor:
          theme.name === 'dark'
            ? colord(bgColor).lighten(0.05).toRgbString()
            : colord(bgColor).darken(0.03).toRgbString()
      }}
      transition={{
        duration: 0.1
      }}
    />
  )
}

export default styled(Button)`
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`
