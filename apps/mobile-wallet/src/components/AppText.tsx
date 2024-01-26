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

import { TextProps } from 'react-native'
import styled, { css, DefaultTheme } from 'styled-components/native'

import { themes, ThemeType } from '~/style/themes'

type FontColor = keyof DefaultTheme['font']
type GlobalColor = keyof DefaultTheme['global']

export interface AppTextProps extends TextProps {
  bold?: boolean
  semiBold?: boolean
  medium?: boolean
  color?: FontColor | GlobalColor | string
  colorTheme?: ThemeType
  size?: number
}

export default styled.Text<AppTextProps>`
  color: ${({ color, theme, colorTheme }) => {
    const th = colorTheme ? themes[colorTheme] : theme

    return color ? th.font[color as FontColor] || th.global[color as GlobalColor] || color : th.font.primary
  }};

  font-weight: 400;

  ${({ bold }) =>
    bold &&
    css`
      font-weight: 700;
    `}

  ${({ semiBold }) =>
    semiBold &&
    css`
      font-weight: 600;
    `}

  ${({ medium }) =>
    medium &&
    css`
      font-weight: 500;
    `}

  ${({ size = 15 }) =>
    size &&
    css`
      font-size: ${size}px;
    `}
`
