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

import Ionicons from '@expo/vector-icons/Ionicons'
import { colord } from 'colord'
import { ComponentProps, ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS } from '~/style/globalStyle'

export interface ButtonProps extends PressableProps {
  title?: string
  type?: 'primary' | 'secondary' | 'transparent' | 'tint'
  variant?: 'default' | 'contrast' | 'accent' | 'valid' | 'alert'
  style?: StyleProp<TextStyle & ViewStyle>
  wide?: boolean
  centered?: boolean
  iconProps?: ComponentProps<typeof Ionicons>
  color?: string
  round?: boolean
  flex?: boolean
  children?: ReactNode
  compact?: boolean
}

const Button = ({
  style,
  title,
  type = 'primary',
  variant = 'default',
  disabled,
  iconProps,
  children,
  round,
  color,
  centered,
  compact,
  flex,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const hasOnlyIcon = !!iconProps && !title && !children

  const bg = {
    default: theme.button.primary,
    contrast: theme.font.primary,
    accent: theme.button.primary,
    valid: colord(theme.global.valid).alpha(0.1).toRgbString(),
    alert: colord(theme.global.alert).alpha(0.1).toRgbString(),
    transparent: 'transparent'
  }[variant]

  const font =
    color ??
    {
      default: theme.font.primary,
      contrast: theme.font.contrast,
      accent: theme.global.accent,
      valid: theme.global.valid,
      alert: theme.global.alert
    }[variant]

  const buttonStyle: PressableProps['style'] = ({ pressed }) => [
    {
      opacity: pressed || disabled ? 0.5 : 1,
      backgroundColor: {
        primary: bg,
        secondary: 'transparent',
        transparent: 'transparent',
        tint: color ? colord(color).alpha(0.05).toHex() : ''
      }[type],
      borderWidth: {
        primary: 0,
        secondary: 2,
        transparent: 0,
        tint: 0
      }[type],
      borderColor: {
        primary: 'transparent',
        secondary: bg,
        transparent: undefined,
        tint: undefined
      }[type],
      flex: flex ? 1 : 0,
      width: round ? 43 : props.wide ? '75%' : hasOnlyIcon ? 43 : 'auto',
      height: compact ? 30 : hasOnlyIcon ? 43 : 55,
      borderRadius: round || compact ? 100 : BORDER_RADIUS,
      justifyContent: round ? 'center' : undefined,
      minWidth: centered ? 200 : undefined,
      marginVertical: centered ? 0 : undefined,
      marginHorizontal: centered ? 'auto' : undefined,
      paddingVertical: compact ? 5 : !hasOnlyIcon ? 0 : undefined,
      paddingHorizontal: compact ? 10 : !hasOnlyIcon ? 25 : undefined,
      gap: compact ? 5 : undefined
    },
    style
  ]

  if (!iconProps && !title && !children)
    throw new Error('At least one of the following properties is required: icon, title, or children')

  return (
    <Pressable style={buttonStyle} disabled={disabled} {...props}>
      {title && (
        <AppText style={{ flexGrow: 1, color: font, textAlign: 'center' }} medium size={compact ? 14 : 16}>
          {title}
        </AppText>
      )}
      {children}
      {iconProps && <Ionicons color={font} size={compact ? 16 : hasOnlyIcon ? 22 : 20} {...iconProps} />}
    </Pressable>
  )
}

export default styled(Button)`
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-direction: row;
`
