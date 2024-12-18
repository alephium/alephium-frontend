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
import { sidebarExpandThresholdPx } from '@/style/globalStyles'

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
        role="secondary"
        aria-label={label}
        onClick={handleClick}
        Icon={Icon}
        transparent={!isActive}
        isActive={isActive}
        data-tooltip-id="sidenav"
        data-tooltip-content={label}
        iconColor={theme.font.primary}
        wide
      >
        <LabelContainer>{label}</LabelContainer>
      </ButtonStyled>
    </>
  )
}

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  margin: 0;
  border-radius: var(--radius-big);
  text-align: left;
  gap: 14px;
  font-weight: var(--fontWeight-medium);
  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      background-color: ${theme.bg.highlight};
      color: ${theme.font.primary};
    `}

  @media (max-width: ${sidebarExpandThresholdPx}px) {
    gap: 0;
    width: 42px;
    min-width: 42px;
    padding: 11px;
  }
`

const TooltipStyleOverride = createGlobalStyle`
  @media (min-width: ${sidebarExpandThresholdPx}px) {
    #sidenav {
      display: none !important;
    }
  }
`

const LabelContainer = styled.div`
  width: 0;
  transition: width 0.4s ease-in-out;
  overflow: hidden;

  @media (min-width: ${sidebarExpandThresholdPx}px) {
    width: auto;
  }
`

export default NavItem
