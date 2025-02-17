import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import styled from 'styled-components'

import useAnalytics from '@/features/analytics/useAnalytics'
import { toggleTheme } from '@/features/theme/themeUtils'
import { useAppSelector } from '@/hooks/redux'
import { onEnterOrSpace } from '@/utils/misc'

interface ThemeSwitcherProps {
  className?: string
}

const switcherSize = 34

const lightColor = '#ffc95c'
const darkColor = '#ffb623'

const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const theme = useAppSelector((state) => state.global.theme)
  const { sendAnalytics } = useAnalytics()

  const isDark = theme === 'dark'

  const handleThemeToggle = () => {
    toggleTheme(isDark ? 'light' : 'dark')

    sendAnalytics({ event: 'Toggled theme', props: { theme } })
  }

  return (
    <div
      className={className}
      onClick={handleThemeToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => onEnterOrSpace(e, handleThemeToggle)}
    >
      <ThemeRotatingContainer animate={{ rotate: isDark ? 0 : 180 }} initial={{ rotate: isDark ? 0 : 180 }}>
        <ThemeIconContainer>
          <Moon size={16} stroke={lightColor} />
        </ThemeIconContainer>
        <ThemeIconContainer>
          <Sun size={16} stroke={darkColor} />
        </ThemeIconContainer>
      </ThemeRotatingContainer>
    </div>
  )
}

export default styled(ThemeSwitcher)`
  display: flex;
  overflow: hidden;
  height: ${switcherSize}px;
  width: ${switcherSize}px;
  border-radius: ${switcherSize}px;
  flex-shrink: 0;
`

const ThemeRotatingContainer = styled(motion.div)`
  transform-origin: 50% 100%;

  &:hover {
    cursor: pointer;
  }
`

const ThemeIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${switcherSize}px;
  width: ${switcherSize}px;
  border-radius: ${switcherSize}px;
`
