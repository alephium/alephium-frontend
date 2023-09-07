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

import { ReactNode, useEffect, useRef, useState } from 'react'
import {
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  ViewStyle
} from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import HighlightRow from '~/components/Row'

export type InputValue = string | number | undefined | unknown
export type RenderValueFunc<T> = T extends InputValue ? (value: T) => ReactNode : never

export interface InputProps<T extends InputValue> extends Omit<TextInputProps, 'value'> {
  value: T
  label: string
  onPress?: () => void
  resetDisabledColor?: boolean
  RightContent?: ReactNode
  renderValue?: RenderValueFunc<T>
  error?: string
  style?: StyleProp<ViewStyle>
}

const Input = <T extends InputValue>({
  label,
  style,
  value,
  onPress,
  onFocus,
  onBlur,
  resetDisabledColor,
  RightContent,
  renderValue,
  error,
  ...props
}: InputProps<T>) => {
  const theme = useTheme()
  const [isActive, setIsActive] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const renderedValue = renderValue ? renderValue(value) : value ? (value as object).toString() : ''
  const showCustomValueRendering = typeof renderedValue !== 'string' && renderedValue !== undefined

  const labelStyle = useAnimatedStyle(() => ({
    top: withTiming(!isActive ? -10 : -35, { duration: 100 })
  }))

  const labelTextStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(!isActive ? 14 : 11, { duration: 100 })
  }))

  useEffect(() => {
    if (renderedValue) {
      setIsActive(true)
    }
  }, [renderedValue])

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsActive(true)
    onFocus && onFocus(e)
  }

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    !renderedValue && setIsActive(false)
    onBlur && onBlur(e)
  }

  return (
    <HighlightRow onPress={onPress} isInput hasRightContent={!!RightContent} style={style}>
      <InputContainer>
        <Label style={labelStyle}>
          <LabelText style={labelTextStyle}>{label}</LabelText>
        </Label>
        {showCustomValueRendering && <CustomRenderedValue>{renderedValue}</CustomRenderedValue>}
        <TextInputStyled
          selectionColor={theme.gradient.yellow}
          value={renderedValue?.toString()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={inputRef}
          style={resetDisabledColor && !props.editable ? { color: theme.font.primary } : undefined}
          hide={showCustomValueRendering}
          {...props}
        />
        {error && <Error>{error}</Error>}
      </InputContainer>
      {RightContent}
    </HighlightRow>
  )
}

export default styled(Input)`
  background-color: ${({ theme }) => theme.button.primary};
`

const InputContainer = styled.View`
  position: relative;
  flex: 1;
`

const TextInputStyled = styled.TextInput<{ hide?: boolean }>`
  height: 100%;
  padding-top: 12px;
  color: ${({ theme }) => theme.font.primary};

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
`

const Label = styled(Animated.View)`
  position: absolute;
  bottom: -10px;
  left: 0;
  justify-content: center;
`

const LabelText = styled(Animated.Text)`
  color: ${({ theme }) => theme.font.secondary};
`

const CustomRenderedValue = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  height: 100%;
`

const Error = styled(AppText)`
  color: ${({ theme }) => theme.global.alert};
  position: absolute;
  bottom: 5px;
  left: 0;
  font-size: 11px;
`
