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

import { ALPH } from '@alephium/token-list'
import { colord } from 'colord'
import styled, { css, DefaultTheme } from 'styled-components'

import Amount from './Amount'

type BadgeType = 'plus' | 'minus' | 'neutral' | 'neutralHighlight'

interface BadgeProps {
  type: BadgeType
  content?: JSX.Element | string | undefined
  amount?: string | bigint | undefined
  assetId?: string
  displayAmountSign?: boolean
  inline?: boolean
  floatRight?: boolean
  minWidth?: number
  compact?: boolean
  className?: string
}

const Badge = ({ content, className, amount, assetId, displayAmountSign = false }: BadgeProps) => (
  <div className={className}>
    <BadgeContent>
      {amount ? (
        <Amount
          assetId={assetId || ALPH.id}
          value={BigInt(amount)}
          displaySign={displayAmountSign}
          highlight={displayAmountSign}
        />
      ) : (
        content
      )}
    </BadgeContent>
  </div>
)

const getBadgeColor = (badgeType: BadgeType, theme: DefaultTheme) => {
  let backgroundColor
  let color
  let borderColor = 'transparent'

  switch (badgeType) {
    case 'plus':
      backgroundColor = colord(theme.global.valid).alpha(0.08).toHex()
      color = theme.global.valid
      borderColor = colord(theme.global.valid).alpha(0.15).toHex()
      break
    case 'minus':
      backgroundColor = 'rgba(243, 113, 93, 0.1)'
      color = theme.global.alert
      borderColor = colord(theme.global.alert).alpha(0.15).toHex()
      break
    case 'neutral':
      backgroundColor = theme.bg.tertiary
      color = theme.font.secondary
      break
    case 'neutralHighlight':
      backgroundColor = theme.bg.tertiary
      color = theme.font.primary
      borderColor = theme.border.primary
  }

  return { backgroundColor, color, borderColor }
}

export default styled(Badge)`
  ${({ type, inline = false, floatRight = false, minWidth, compact, theme }) => {
    const { color, backgroundColor, borderColor } = getBadgeColor(type, theme)

    return css`
      display: ${inline ? 'inline-block' : 'block'};
      color: ${color};
      background-color: ${backgroundColor};
      border: 1px solid ${borderColor};
      float: ${inline ? 'none' : floatRight ? 'right' : 'left'};
      min-width: ${minWidth ? minWidth + 'px' : 'auto'};
      border-radius: ${compact ? '3px' : '5px'};
      font-size: ${compact ? '10px' : 'inherit'};
      padding: ${compact ? '2px 4px' : '4px 6px'};
    `
  }}
`

const BadgeContent = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`
