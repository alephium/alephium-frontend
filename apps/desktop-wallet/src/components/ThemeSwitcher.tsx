import { colord } from 'colord'
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

const switcherSize = 32

const lightColor = '#fab01e'
const darkColor = '#422c08'

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
        <ThemeIconContainer style={{ backgroundColor: colord(darkColor).alpha(0.4).toHex() }}>
          <Moon size={20} stroke={lightColor} />
        </ThemeIconContainer>
        <ThemeIconContainer style={{ backgroundColor: colord(lightColor).alpha(0.1).toHex() }}>
          <Sun size={20} stroke={lightColor} />
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
