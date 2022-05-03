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

import { FC } from 'react'
import { Pressable, PressableProps, StyleProp, Text, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS } from '../../style/globalStyle'

export interface ButtonProps extends PressableProps {
  title: string
  type?: 'primary' | 'secondary'
  variant?: 'default' | 'contrast' | 'accent'
  style?: StyleProp<ViewStyle>
  wide?: boolean
  children?: React.ReactNode
}

const Button: FC<ButtonProps> = ({
  style,
  title,
  type = 'primary',
  variant = 'default',
  disabled,
  children,
  ...props
}) => {
  const theme = useTheme()

  const colors = {
    bg: {
      default: theme.font.primary,
      contrast: theme.bg.primary,
      accent: theme.global.accent
    }[variant],
    font: {
      default: type === 'primary' ? theme.font.contrast : theme.font.primary,
      contrast: type === 'primary' ? theme.font.primary : theme.font.contrast,
      accent: type === 'primary' ? theme.font.contrast : theme.global.accent
    }[variant]
  }

  const buttonStyle: PressableProps['style'] = ({ pressed }) => [
    {
      opacity: pressed || disabled ? 0.5 : 1,
      backgroundColor: { primary: colors.bg, secondary: 'transparent' }[type],
      borderWidth: { primary: 0, secondary: 2 }[type],
      borderColor: { primary: 'transparent', secondary: colors.bg }[type],
      elevation: type === 'primary' ? 8 : 0, // TODO: iOS shadows
      width: props.wide ? '75%' : 'auto'
    },
    style
  ]

  return (
    <Pressable style={buttonStyle} disabled={disabled} {...props}>
      <ButtonText style={{ color: colors.font }}>{title}</ButtonText>
      {children}
    </Pressable>
  )
}

export default styled(Button)`
  border-radius: ${BORDER_RADIUS}px;
  padding: 0 25px;
  height: 55px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const ButtonText = styled(Text)`
  font-weight: bold;
`
