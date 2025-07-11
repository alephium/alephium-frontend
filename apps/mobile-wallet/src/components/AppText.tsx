import { forwardRef } from 'react'
import { Platform, Text, TextProps } from 'react-native'
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
  truncate?: boolean
}

const AppText = forwardRef<Text, AppTextProps>(({ children, truncate, ...props }, ref) => (
  <TextStyled ref={ref} numberOfLines={truncate || props.adjustsFontSizeToFit ? 1 : undefined} {...props}>
    {children}
    {/* Hack to fix Android text truncation. See https://github.com/alephium/alephium-frontend/issues/1118 */}
    {truncate && Platform.OS === 'android' && ' '}
  </TextStyled>
))

export default AppText

export const TextStyled = styled(Text)<AppTextProps>`
  color: ${({ color, theme, colorTheme }) => {
    const th = colorTheme ? themes[colorTheme] : theme

    return color ? th.font[color as FontColor] || th.global[color as GlobalColor] || color : th.font.primary
  }};

  font-family: 'Geist-Medium';

  ${({ bold }) =>
    bold &&
    css`
      font-family: 'Geist-Bold';
    `}

  ${({ semiBold }) =>
    semiBold &&
    css`
      font-family: 'Geist-SemiBold';
    `}

  ${({ medium }) =>
    medium &&
    css`
      font-family: 'Geist-Medium';
    `}

  ${({ size = 15 }) =>
    size &&
    css`
      font-size: ${size}px;
    `}
`
