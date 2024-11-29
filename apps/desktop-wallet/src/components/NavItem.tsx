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

import { LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { createGlobalStyle, css, useTheme } from 'styled-components'

import Button from '@/components/Button'
import { SIDEBAR_EXPAND_THRESHOLD_PX } from '@/components/PageComponents/SideBar'

interface NavItemProps {
  Icon: LucideIcon
  label: string
  to?: string
  onClick?: () => void
}

const NavItem = ({ Icon, label, to, onClick }: NavItemProps) => {
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
    <>
      <TooltipStyleOverride />
      <ButtonStyled
        aria-label={label}
        onClick={handleClick}
        Icon={Icon}
        borderless
        transparent={!isActive}
        isActive={isActive}
        data-tooltip-id="sidenav"
        data-tooltip-content={label}
        iconColor={isActive ? theme.global.accent : theme.font.primary}
        rounded
      >
        <LabelContainer>{label}</LabelContainer>
      </ButtonStyled>
    </>
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

  transition: width 0.4s ease-in-out;

  @media (max-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
    gap: 0;
    width: 42px;
    min-width: 42px;
  }
`

const TooltipStyleOverride = createGlobalStyle`
  @media (min-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
    #sidenav {
      display: none !important;
    }
  }
`

const LabelContainer = styled.div`
  display: none;
  @media (min-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
    display: block;
  }
`

export default NavItem
