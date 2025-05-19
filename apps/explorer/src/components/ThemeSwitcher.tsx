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

const togglePositionVariants = {
  light: { left: 0 },
  dark: { left: toggleWidth - toggleIndicatorSize }
}

const toggleColorVariants = {
  light: { backgroundColor: '#F6C76A' },
  dark: { backgroundColor: '#3A0595' }
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
      <ToggleFloatingIndicatorContainer
        variants={togglePositionVariants}
        animate={theme}
        transition={{ type: 'spring', stiffness: 300, damping: 60 }}
      >
        <ToggleFloatingIndicator
          variants={toggleColorVariants}
          animate={theme}
          transition={{ type: 'spring', stiffness: 300, damping: 60 }}
        />
      </ToggleFloatingIndicatorContainer>
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

const ToggleFloatingIndicatorContainer = styled(motion.div)`
  position: absolute;
  width: ${toggleIndicatorSize}px;
  height: ${toggleIndicatorSize}px;
  border-radius: 60px;
  padding: 2px;
  z-index: 0;
`

const ToggleFloatingIndicator = styled(motion.div)`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.font.primary};
  border-radius: 60px;
  padding: 2px;
`
