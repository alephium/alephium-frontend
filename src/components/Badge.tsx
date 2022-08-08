/*
Copyright 2018 - 2022 The Alephium Authors
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

import { ReactNode } from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { css } from 'styled-components/native'
import tinycolor from 'tinycolor2'

interface BadgeProps {
  children: ReactNode
  color?: string
  rounded?: boolean
  border?: boolean
  light?: boolean
  style?: StyleProp<ViewStyle>
}

const Badge = ({ style, color, children }: BadgeProps) => {
  return (
    <View style={style}>
      <BadgeText color={color}>{children}</BadgeText>
    </View>
  )
}

export default styled(Badge)`
  ${({ color, theme, rounded, border, light }) => {
    const usedColor = color || theme.font.primary

    return css`
      padding: 5px 10px;
      align-items: center;
      justify-content: center;
      border-radius: ${rounded ? '30px' : '7px'};

      ${border &&
      css`
        border: 1px solid ${tinycolor(usedColor).setAlpha(0.2).toString()};
      `};

      ${!light &&
      css`
        background-color: ${tinycolor(usedColor).setAlpha(0.08).toString()};
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
    `
  }}
`

const BadgeText = styled(Text)<{ color?: string }>`
  ${({ color, theme }) => css`
    color: ${color || theme.font.primary};
  `}
`
