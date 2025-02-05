import { colord } from 'colord'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { HasTooltip } from '@/components/Tooltip'

interface ActionLinkProps {
  onClick: () => void
  children?: ReactNode
  Icon?: LucideIcon
  iconPosition?: 'right' | 'left'
  withBackground?: boolean
  className?: string
}

const ActionLink = ({ Icon, children, tooltip, ...props }: HasTooltip<ActionLinkProps>) => (
  <ActionLinkStyled {...props} data-tooltip-id="default" data-tooltip-content={tooltip}>
    <ChildrenContainer>{children}</ChildrenContainer>
    {Icon && (
      <IconContainer>
        <Icon size={14} />
      </IconContainer>
    )}
  </ActionLinkStyled>
)

export default ActionLink

const ActionLinkStyled = styled.button<ActionLinkProps>`
  color: ${({ theme }) => theme.font.accent};
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: inherit;
  font-weight: inherit;
  flex-direction: ${({ iconPosition }) => (iconPosition === 'left' ? 'row-reverse' : 'row')};
  gap: 5px;
  padding: 0;
  max-width: 100%;

  &:hover {
    color: ${({ theme }) => colord(theme.font.accent).darken(0.1).toRgbString()};
  }

  &:focus-visible {
    text-decoration: underline;
  }

  ${({ withBackground }) =>
    withBackground &&
    css`
      background-color: ${({ theme }) => theme.bg.accent};
      padding: 8px;
      border-radius: var(--radius-medium);
    `}
`

const ChildrenContainer = styled.div`
  display: flex;
  align-items: center;
  text-align: initial;
  width: 100%;
`

const IconContainer = styled.div`
  display: flex;
`
