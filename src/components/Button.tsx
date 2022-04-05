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

import { Pressable, PressableProps, StyleProp, Text, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { borderRadius } from '../style/globalStyle'

interface ButtonProps extends PressableProps {
  title: string
  type?: 'primary' | 'secondary'
  variant?: 'default' | 'contrast' | 'accent'
  style?: StyleProp<ViewStyle>
}

const Button = ({ style, title, type = 'primary', variant = 'default', ...props }: ButtonProps) => {
  const theme = useTheme()

  const colors = {
    bg: {
      default: theme.font.primary,
      contrast: theme.bg.primary,
      accent: theme.global.accent
    }[variant],
    font: {
      default: type === 'primary' ? theme.bg.primary : theme.font.primary,
      contrast: type === 'primary' ? theme.font.primary : theme.bg.primary,
      accent: type === 'primary' ? theme.bg.primary : theme.global.accent
    }[variant]
  }

  const buttonStyle: PressableProps['style'] = ({ pressed }) => [
    { opacity: pressed ? 0.5 : 1 },
    {
      backgroundColor: { primary: colors.bg, secondary: 'transparent' }[type],
      borderWidth: { primary: 0, secondary: 2 }[type],
      borderColor: { primary: 'transparent', secondary: colors.bg }[type]
    },
    style
  ]

  return (
    <Pressable style={buttonStyle} {...props}>
      <ButtonText style={{ color: colors.font }}>{title}</ButtonText>
    </Pressable>
  )
}

export default styled(Button)`
  border-radius: ${borderRadius};
  padding: 15px 25px;
  align-items: center;
`

const ButtonText = styled(Text)`
  font-weight: bold;
`
