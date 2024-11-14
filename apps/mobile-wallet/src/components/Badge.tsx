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
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { css } from 'styled-components/native'

interface BadgeProps {
  children: ReactNode
  color?: string
  rounded?: boolean
  border?: boolean
  light?: boolean
  solid?: boolean
  style?: StyleProp<ViewStyle>
}

const Badge = ({ style, color, solid, children }: BadgeProps) => (
  <View style={style}>
    {['string', 'number'].includes(typeof children) ? (
      <BadgeText color={color} solid={solid}>
        {children}
      </BadgeText>
    ) : (
      children
    )}
  </View>
)

export default styled(Badge)`
  flex-direction: row;
  gap: 4px;

  ${({ color, theme, rounded, border, light, solid }) => {
    const usedColor = color || theme.font.primary

    return css`
      min-width: 25px;
      padding: 2px 8px;
      align-items: center;
      justify-content: center;
      border-radius: ${rounded ? '30px' : '7px'};

      ${border &&
      css`
        border: 1px solid ${colord(usedColor).alpha(0.2).toHex()};
      `};

      ${!light &&
      css`
        background-color: ${colord(usedColor).alpha(0.08).toHex()};
      `}

      ${light &&
      border &&
      css`
        border-color: ${({ theme }) => theme.border.secondary};
      `}

      ${light &&
      !border &&
      css`
        background-color: ${({ theme }) => theme.bg.secondary};
      `}

      ${solid &&
      css`
        background-color: ${usedColor};
      `}
    `
  }}
`

const BadgeText = styled.Text<{ color?: string; solid?: boolean }>`
  ${({ color, solid, theme }) => css`
    color: ${solid ? 'white' : color || theme.font.primary};
  `}
`
