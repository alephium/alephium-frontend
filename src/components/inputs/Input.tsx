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

import { useState } from 'react'
import { StyleProp, TextInputProps, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { BORDER_RADIUS, INPUTS_HEIGHT } from '../../style/globalStyle'

interface InputProps extends TextInputProps {
  label: string
  color?: string
  style?: StyleProp<ViewStyle>
}

const Input = ({ label, style, color, value, ...props }: InputProps) => {
  const theme = useTheme()
  const [isActive, setIsActive] = useState(false)

  const handleFocus = () => {
    setIsActive(true)
  }

  const handleBlur = () => {
    if (!value) setIsActive(false)
  }

  const labelStyle = useAnimatedStyle(() => ({
    top: withTiming(!isActive ? 0 : -35, { duration: 100 })
  }))

  const labelTextStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(!isActive ? 14 : 11, { duration: 100 })
  }))

  return (
    <View style={style}>
      <TextInputStyled
        selectionColor={theme.gradient.yellow}
        style={{ color: color }}
        value={value}
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <Label style={labelStyle}>
        <LabelText style={labelTextStyle}>{label}</LabelText>
      </Label>
    </View>
  )
}

export default styled(Input)`
  position: relative;
`

const leftPadding = 15

const TextInputStyled = styled.TextInput`
  border-radius: ${BORDER_RADIUS}px;
  height: ${INPUTS_HEIGHT}px;
  padding: 0 ${leftPadding}px;
  background-color: ${({ theme }) => theme.bg.highlight};
`

const Label = styled(Animated.View)`
  position: absolute;
  left: ${leftPadding}px;
  bottom: 0;
  justify-content: center;
`

const LabelText = styled(Animated.Text)`
  color: ${({ theme }) => theme.font.secondary};
  font-size: ${({ isActive }) => (!isActive ? 14 : 11)}px;
`
