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
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'
import tinycolor from 'tinycolor2'

import { BORDER_RADIUS } from '../../style/globalStyle'

export interface ButtonProps extends PressableProps {
  title?: string
  type?: 'primary' | 'secondary'
  variant?: 'default' | 'contrast' | 'accent' | 'valid' | 'alert'
  style?: StyleProp<ViewStyle>
  wide?: boolean
  centered?: boolean
  onlyIcon?: boolean
  prefixIcon?: ReactNode
  children?: ReactNode
}

const Button = ({
  style,
  title,
  type = 'primary',
  variant = 'default',
  disabled,
  onlyIcon,
  prefixIcon,
  children,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const colors = {
    bg: {
      default: theme.font.primary,
      contrast: theme.bg.highlight,
      accent: theme.global.accent,
      valid: tinycolor(theme.global.valid).setAlpha(0.1).toRgbString(),
      alert: tinycolor(theme.global.alert).setAlpha(0.1).toRgbString()
    }[variant],
    font: {
      default: type === 'primary' ? theme.font.contrast : theme.font.primary,
      contrast: type === 'primary' ? theme.font.primary : theme.font.contrast,
      accent: type === 'primary' ? theme.font.contrast : theme.global.accent,
      valid: theme.global.valid,
      alert: theme.global.alert
    }[variant]
  }

  const buttonStyle: PressableProps['style'] = ({ pressed }) => [
    {
      opacity: pressed || disabled ? 0.5 : 1,
      backgroundColor: { primary: colors.bg, secondary: 'transparent' }[type],
      borderWidth: { primary: 0, secondary: 2 }[type],
      borderColor: { primary: 'transparent', secondary: colors.bg }[type],
      width: props.wide ? '75%' : 'auto'
    },
    style
  ]

  console.log('Button renders')

  return (
    <Pressable style={buttonStyle} disabled={disabled} {...props}>
      {prefixIcon && <PrefixIcon>{prefixIcon}</PrefixIcon>}
      {title && <ButtonText style={{ color: colors.font }}>{title}</ButtonText>}
      {children}
    </Pressable>
  )
}

export default styled(Button)`
  border-radius: ${BORDER_RADIUS}px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 30px;
  flex-direction: row;

  ${({ centered }) =>
    centered &&
    css`
      min-width: 200px;
      margin: 0 auto;
    `}

  ${({ onlyIcon }) =>
    onlyIcon
      ? css`
          width: 45px;
        `
      : css`
          padding: 0 25px;
        `};
  height: ${({ onlyIcon }) => (onlyIcon ? '45px' : '55px')};
`

const ButtonText = styled.Text`
  font-weight: bold;
`

const PrefixIcon = styled.View`
  margin-right: 15px;
`
