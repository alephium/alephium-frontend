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

import { colord } from 'colord'
import { LucideIcon } from 'lucide-react'
import styled, { css } from 'styled-components'

import { HasTooltip } from '@/components/Tooltip'

interface ActionLinkProps {
  onClick: () => void
  Icon?: LucideIcon
  iconPosition?: 'right' | 'left'
  withBackground?: boolean
  className?: string
}

const ActionLink: FC<HasTooltip<ActionLinkProps>> = ({ className, Icon, children, onClick, tooltip }) => (
  <button className={className} onClick={onClick} data-tooltip-id="default" data-tooltip-content={tooltip}>
    {children}
    {Icon && (
      <IconContainer>
        <Icon size={14} />
      </IconContainer>
    )}
  </button>
)

export default styled(ActionLink)`
  color: ${({ theme }) => theme.global.accent};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: inherit;
  font-weight: inherit;
  flex-direction: ${({ iconPosition }) => (iconPosition === 'left' ? 'row-reverse' : 'row')};
  gap: 5px;
  padding: 0;

  &:hover {
    color: ${({ theme }) => colord(theme.global.accent).darken(0.1).toRgbString()};
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

const IconContainer = styled.div`
  display: flex;
`
