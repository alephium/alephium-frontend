import { motion, Transition } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import styled, { css, useTheme } from 'styled-components'

import { onEnterOrSpace } from '@/utils/misc'

interface ToggleProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  disabled?: boolean
  ToggleIcons?: [LucideIcon, LucideIcon]
  handleColors?: [string, string]
  label?: string
  className?: string
}

const Toggle = ({ toggled, onToggle, className, disabled, ToggleIcons, handleColors, label }: ToggleProps) => {
  const theme = useTheme()
  const [toggleWidth, setToggleWidth] = useState(0)
  const [ToggleIconRight, ToggleIconLeft] = ToggleIcons ?? [undefined, undefined]

  const toggleBackgroundVariants = {
    off: {
      backgroundColor: theme.name === 'light' ? 'rgba(0, 0, 0, 0.15)' : theme.bg.background2
    },
    on: { backgroundColor: handleColors ? theme.bg.background2 : theme.global.accent }
  }

  const handleContainerVariants = {
    off: { left: 0 },
    on: { left: toggleWidth / 2 }
  }

  const handleVariants = {
    off: { backgroundColor: handleColors?.[0] ?? 'var(--color-white)' },
    on: { backgroundColor: handleColors?.[1] ?? 'var(--color-white)' }
  }

  useEffect(() => {
    setToggleWidth(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--toggleWidth')))
  }, [])

  const toggleState = toggled ? 'on' : 'off'

  const transition: Transition = { duration: 0.2, type: 'tween' }

  const handleSwitch = useCallback(() => {
    if (!disabled) {
      onToggle(!toggled)
    }
  }, [disabled, toggled, onToggle])

  const getToggleIconColor = (isActive: boolean) => (isActive ? 'var(--color-white)' : theme.font.tertiary)

  return (
    <StyledToggle
      onClick={handleSwitch}
      onKeyDown={(e) => onEnterOrSpace(e, handleSwitch)}
      className={className}
      aria-label={label}
      aria-checked={toggled}
      role="checkbox"
      tabIndex={0}
      toggled={toggled}
      variants={toggleBackgroundVariants}
      animate={toggleState}
      transition={transition}
      disabled={disabled}
    >
      <ToggleHandleContainer variants={handleContainerVariants} animate={toggleState} transition={transition}>
        <ToggleHandle variants={handleVariants} animate={toggleState} transition={transition} />
      </ToggleHandleContainer>
      {ToggleIconRight && ToggleIconLeft && (
        <ToggleContent>
          <ToggleIconContainer>
            <ToggleIconRight color={getToggleIconColor(!toggled)} size={16} className="toggle-icon" strokeWidth={2} />
          </ToggleIconContainer>
          <ToggleIconContainer>
            <ToggleIconLeft color={getToggleIconColor(toggled)} size={16} className="toggle-icon" strokeWidth={2} />
          </ToggleIconContainer>
        </ToggleContent>
      )}
    </StyledToggle>
  )
}

export default Toggle

export const StyledToggle = styled(motion.div)<Omit<ToggleProps, 'onToggle'>>`
  position: relative;
  display: flex;
  align-items: center;
  width: var(--toggleWidth);
  height: calc(var(--toggleWidth) / 2);
  border-radius: var(--toggleWidth);
  overflow: hidden;
  cursor: pointer;
  box-sizing: content-box;
  border: 1px solid ${({ theme }) => (theme.name === 'dark' ? theme.border.primary : 'transparent')};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px ${({ theme }) => theme.global.accent};
    border: 1px solid ${({ theme }) => theme.global.accent};
  }

  svg {
    cursor: pointer;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
    `}
`

const ToggleHandleContainer = styled(motion.div)`
  position: absolute;
  width: calc(var(--toggleWidth) / 2);
  height: calc(var(--toggleWidth) / 2);
  padding: 2px;
`

const ToggleHandle = styled(motion.div)`
  height: 100%;
  width: 100%;
  background-color: var(--color-white);
  border-radius: var(--toggleWidth);
`

const ToggleContent = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
`

const ToggleIconContainer = styled.div`
  width: 50%;
  display: flex;

  .toggle-icon {
    margin: auto;
  }
`
