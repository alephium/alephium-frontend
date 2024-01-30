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
import React from 'react'
import { RiMoonLine, RiSunLine } from 'react-icons/ri'
import styled from 'styled-components'

import { useSettings } from '@/contexts/settingsContext'
import { ThemeType } from '@/styles/themes'

interface ThemeSwitcherProps {
  className?: string
}

const getButtonColor = (theme: ThemeType, buttonTheme: string) =>
  theme === buttonTheme ? (theme === 'dark' ? '#F6C76A' : 'white') : '#646775'

const toggleWidth = 60
const toggleHeight = toggleWidth / 2
const toggleIndicatorSize = toggleWidth / 2

const toggleVariants = {
  light: { left: 0, backgroundColor: '#F6C76A' },
  dark: { left: toggleWidth - toggleIndicatorSize, backgroundColor: '#3A0595' }
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { theme, switchTheme } = useSettings()

  return (
    <StyledThemeSwitcher onClick={() => switchTheme(theme === 'light' ? 'dark' : 'light')} className={className}>
      <ToggleContent>
        <ToggleIcon>
          <RiSunLine onClick={() => switchTheme('light')} color={getButtonColor(theme, 'light')} size={18} />
        </ToggleIcon>
        <ToggleIcon>
          <RiMoonLine onClick={() => switchTheme('dark')} color={getButtonColor(theme, 'dark')} size={18} />
        </ToggleIcon>
      </ToggleContent>
      <ToggleFloatingIndicator
        variants={toggleVariants}
        animate={theme}
        transition={{ duration: 0.5, type: 'spring' }}
      />
    </StyledThemeSwitcher>
  )
}

export default ThemeSwitcher

export const StyledThemeSwitcher = styled.div`
  position: relative;
  width: ${toggleWidth}px;
  height: ${toggleHeight}px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: 60px;
  background-color: ${({ theme }) => theme.bg.primary};
  cursor: pointer;
  box-sizing: content-box;

  svg {
    cursor: pointer;
  }
`

const ToggleContent = styled.div`
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  z-index: 1;
`

const ToggleIcon = styled.div`
  display: flex;
  flex: 1;

  * {
    margin: auto;
  }
`

const ToggleFloatingIndicator = styled(motion.div)`
  position: absolute;
  width: ${toggleIndicatorSize}px;
  height: ${toggleIndicatorSize}px;
  background-color: ${({ theme }) => theme.font.primary};
  border-radius: 60px;
  z-index: 0;
`
