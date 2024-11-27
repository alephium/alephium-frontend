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

import { AnimatePresence, motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import Button from '@/components/Button'

interface NavItemProps {
  Icon: LucideIcon
  label: string
  isExpanded: boolean
  to?: string
  onClick?: () => void
}

const NavItem = ({ Icon, label, isExpanded, to, onClick }: NavItemProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const isActive = to !== undefined && location.pathname.startsWith(to)

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <ButtonStyled
      aria-label={label}
      onClick={handleClick}
      Icon={Icon}
      borderless
      transparent={!isActive}
      isActive={isActive}
      data-tooltip-id="sidenav"
      data-tooltip-content={!isExpanded ? label : undefined}
      iconColor={isActive ? theme.global.accent : theme.font.primary}
      rounded
      animate={!isExpanded ? { width: 42, minWidth: 42, gap: 0 } : {}}
    >
      <AnimatePresence>
        {isExpanded && (
          <LabelContainer
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ delay: 1 }}
          >
            {label}
          </LabelContainer>
        )}
      </AnimatePresence>
    </ButtonStyled>
  )
}

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  ${({ isActive, theme }) =>
    isActive
      ? css`
          background-color: ${theme.bg.accent};
          color: ${theme.global.accent};
          stroke: ${theme.global.accent};
        `
      : css`
          stroke: ${theme.font.tertiary};
        `}

  &:not(:hover) {
    opacity: ${({ isActive }) => (isActive ? 1 : 0.5)} !important;
  }

  &:hover {
    border-color: ${({ theme }) => theme.border.primary};
  }
`

const LabelContainer = styled(motion.div)``

export default NavItem
