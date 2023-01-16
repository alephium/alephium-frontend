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

import { colord } from 'colord'
import { ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '../../style/globalStyle'
import AppText from '../AppText'

export interface ButtonProps extends PressableProps {
  title?: string
  type?: 'primary' | 'secondary' | 'transparent'
  variant?: 'default' | 'contrast' | 'accent' | 'valid' | 'alert'
  style?: StyleProp<TextStyle & ViewStyle>
  wide?: boolean
  centered?: boolean
  icon?: ReactNode
  circular?: boolean
  children?: ReactNode
}

const Button = ({
  style,
  title,
  type = 'primary',
  variant = 'default',
  disabled,
  icon,
  children,
  circular,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const colors = {
    bg: {
      default: theme.font.primary,
      contrast: theme.bg.primary,
      accent: theme.global.accent,
      valid: colord(theme.global.valid).alpha(0.1).toRgbString(),
      alert: colord(theme.global.alert).alpha(0.1).toRgbString(),
      transparent: 'transparent'
    },
    font: {
      default: type === 'primary' ? theme.font.contrast : theme.font.primary,
      contrast: type === 'primary' ? theme.font.primary : theme.font.contrast,
      accent: type === 'primary' ? theme.font.contrast : theme.global.accent,
      valid: theme.global.valid,
      alert: theme.global.alert
    }
  }

  const bg = colors.bg[variant]
  const font = colors.font[variant]

  const buttonStyle: PressableProps['style'] = ({ pressed }) => [
    {
      opacity: pressed || disabled ? 0.5 : 1,
      backgroundColor: { primary: bg, secondary: 'transparent', transparent: 'transparent' }[type],
      borderWidth: { primary: 0, secondary: 2, transparent: 0 }[type],
      borderColor: { primary: 'transparent', secondary: bg, transparent: undefined }[type],
      width: circular ? 56 : props.wide ? '75%' : 'auto',
      borderRadius: circular ? 100 : undefined,
      justifyContent: circular ? 'center' : undefined
    },
    style
  ]

  if (!icon && !title && !children)
    throw new Error('At least one of the following properties is required: icon, title, or children')

  return circular ? (
    <View style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
      <Pressable style={buttonStyle} disabled={disabled} {...props}>
        {icon && <Icon>{icon}</Icon>}
      </Pressable>
      {title && <ButtonText style={{ color: colors.font.contrast }}>{title}</ButtonText>}
      {children}
    </View>
  ) : (
    <Pressable style={buttonStyle} disabled={disabled} {...props}>
      {icon && <Icon withSpace={!!title || !!children}>{icon}</Icon>}
      {title && <ButtonText style={{ color: font }}>{title}</ButtonText>}
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

  ${({ icon, title, children }) =>
    icon && !title && !children
      ? css`
          width: 45px;
          height: 45px;
        `
      : css`
          padding: 0 25px;
          height: 55px;
        `};
`

const ButtonText = styled(AppText)`
  font-weight: bold;
  text-align: center;
`

const Icon = styled.View<{ withSpace?: boolean }>`
  ${({ withSpace }) =>
    withSpace &&
    css`
      margin-right: 15px;
    `}
`
