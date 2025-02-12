import { LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { createGlobalStyle, useTheme } from 'styled-components'

import Button from '@/components/Button'
import { sidebarExpandThresholdPx } from '@/style/globalStyles'

interface NavItemProps {
  Icon: LucideIcon
  label: string
  colorDark: string
  colorLight: string
  to?: string
  onClick?: () => void
}

const NavItem = ({ Icon, label, to, colorDark, colorLight, onClick }: NavItemProps) => {
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
        role="secondary"
        onClick={handleClick}
        Icon={Icon}
        isActive={isActive}
        data-tooltip-id="sidenav"
        data-tooltip-content={label}
        iconColor={isActive ? (theme.name === 'light' ? colorLight : colorDark) : theme.font.primary}
        wide
      >
        <LabelContainer>{label}</LabelContainer>
      </ButtonStyled>
    </>
  )
}

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  margin: 0;
  text-align: left;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};
  background-color: ${({ isActive }) => !isActive && 'transparent'};
  border-radius: var(--radius-medium);
  backdrop-filter: none;

  @media (max-width: ${sidebarExpandThresholdPx}px) {
    gap: 0;
    width: 42px;
    min-width: 42px;
    padding: 14px;
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
