import { LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'

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
    <ButtonStyled
      aria-label={label}
      onClick={handleClick}
      Icon={Icon}
      borderless={!isActive}
      squared
      role="secondary"
      transparent={!isActive}
      isActive={isActive}
      data-tooltip-id="sidenav"
      data-tooltip-content={label}
      iconColor={theme.font.primary}
    />
  )
}

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  &:not(:hover) {
    opacity: ${({ isActive }) => (isActive ? 1 : 0.5)} !important;
  }

  &:hover {
    border-color: ${({ theme }) => theme.border.primary};
  }
`

export default NavItem
