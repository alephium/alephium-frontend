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

  font-family: 'Inter18pt-Medium';

  ${({ bold }) =>
    bold &&
    css`
      font-family: 'Inter18pt-Bold';
    `}

  ${({ semiBold }) =>
    semiBold &&
    css`
      font-family: 'Inter18pt-SemiBold';
    `}

  ${({ medium }) =>
    medium &&
    css`
      font-family: 'Inter18pt-Medium';
    `}

  ${({ size = 15 }) =>
    size &&
    css`
      font-size: ${size}px;
    `}
`
