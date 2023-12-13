/*
Copyright 2018 - 2023 The Alephium Authors
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

import { motion, Transition } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useCallback } from 'react'
import styled, { css, useTheme } from 'styled-components'

import { onEnterOrSpace } from '@/utils/inputs'

interface ToggleProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  disabled?: boolean
  ToggleIcons?: [LucideIcon, LucideIcon]
  handleColors?: [string, string]
  label?: string
  className?: string
}

// TODO: Share component in the shared lib?
const toggleWidthPx = 40

const Toggle = ({ toggled, onToggle, className, disabled, ToggleIcons, handleColors, label }: ToggleProps) => {
  const theme = useTheme()
  const [ToggleIconRight, ToggleIconLeft] = ToggleIcons ?? [undefined, undefined]

  const toggleBackgroundVariants = {
    off: {
      backgroundColor: theme.name === 'light' ? 'rgba(0, 0, 0, 0.15)' : theme.bg.background2
    },
    on: { backgroundColor: handleColors ? theme.bg.background2 : theme.global.accent }
  }

  const handleContainerVariants = {
    off: { left: 0 },
    on: { left: toggleWidthPx / 2 }
  }

  const handleVariants = {
    off: { backgroundColor: handleColors?.[0] ?? 'white' },
    on: { backgroundColor: handleColors?.[1] ?? 'white' }
  }

  const toggleState = toggled ? 'on' : 'off'

  const transition: Transition = { duration: 0.2, type: 'tween' }

  const handleSwitch = useCallback(() => {
    if (!disabled) {
      onToggle(!toggled)
    }
  }, [disabled, toggled, onToggle])

  const getToggleIconColor = (isActive: boolean) => (isActive ? 'white' : theme.font.tertiary)

  return (
    <StyledToggle
      onClick={handleSwitch}
      onKeyDown={(e) => onEnterOrSpace(e, handleSwitch)}
      className={className}
      aria-label={label}
      aria-checked={toggled}
      role="checkbox"
      tabIndex={0}
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

export const StyledToggle = styled(motion.div)<Pick<ToggleProps, 'disabled'>>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${toggleWidthPx}px;
  height: ${toggleWidthPx / 2}px;
  border-radius: ${toggleWidthPx}px;
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
  width: ${toggleWidthPx / 2}px;
  height: ${toggleWidthPx / 2}px;
  padding: 2px;
`

const ToggleHandle = styled(motion.div)`
  height: 100%;
  width: 100%;
  background-color: var(--color-white);
  border-radius: ${toggleWidthPx}px;
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
