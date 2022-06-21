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

import { StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS, INPUTS_HEIGHT } from '../../style/globalStyle'

interface InputProps extends TextInputProps {
  label: string
  color?: string
  style?: StyleProp<ViewStyle>
}

const Input = ({ label, style, color, ...props }: InputProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
      <Label>{label}</Label>
      <StyledInput selectionColor={theme.gradient.yellow} style={{ color: color }} {...props} />
    </View>
  )
}

const StyledInput = styled(TextInput)`
  border-radius: ${BORDER_RADIUS}px;
  border-color: ${({ theme }) => theme.border.primary};
  border-width: 2px;
  height: ${INPUTS_HEIGHT}px;
  padding: 0 15px;
`

const Label = styled.Text`
  position: absolute;
  top: -25px;
  color: ${({ theme }) => theme.font.secondary};
`

export default Input
