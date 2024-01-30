/*
Copyright 2018 - 2024 The Alephium Authors
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

import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import {
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  ViewProps,
  ViewStyle
} from 'react-native'
import Animated, { AnimatedProps, FadeIn, FadeOut, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import { fastSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AppText from '~/components/AppText'
import Row from '~/components/Row'
import { BORDER_RADIUS } from '~/style/globalStyle'

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
  layout?: AnimatedProps<ViewProps>['layout']
  inputRef?: RefObject<TextInput>
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
  layout,
  inputRef,
  ...props
}: InputProps<T>) => {
  const theme = useTheme()
  const [isActive, setIsActive] = useState(false)
  const localInputRef = useRef<TextInput>(null)
  const usedInputRef = inputRef || localInputRef

  const renderedValue = renderValue ? renderValue(value) : value ? (value as object).toString() : ''
  const showCustomValueRendering = typeof renderedValue !== 'string' && renderedValue !== undefined

  const labelStyle = useAnimatedStyle(() => ({
    bottom: withSpring(!isActive ? 0 : 30, fastSpringConfiguration)
  }))

  const labelTextStyle = useAnimatedStyle(() => ({
    fontSize: withSpring(!isActive ? 15 : 11, fastSpringConfiguration)
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
    <Row
      onPress={onPress}
      isInput
      hasRightContent={!!RightContent}
      style={[
        style,
        {
          shadowColor: 'black',
          shadowOpacity: theme.name === 'light' ? 0.05 : 0.2,
          shadowRadius: 8,
          shadowOffset: { height: 5, width: 0 },
          borderWidth: 1,
          borderColor: theme.border.primary
        }
      ]}
      layout={layout}
    >
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
          ref={usedInputRef}
          forwardedAs={TextInput}
          style={resetDisabledColor && !props.editable ? { color: theme.font.primary } : undefined}
          hide={showCustomValueRendering}
          {...props}
        />
      </InputContainer>
      {RightContent}
      {error && (
        <ErrorContainer
          style={{ shadowColor: 'black', shadowRadius: 5, shadowOpacity: 0.2 }}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Error>{error}</Error>
        </ErrorContainer>
      )}
    </Row>
  )
}

export default styled(Input)`
  background-color: ${({ theme }) => theme.bg.highlight};
  border-radius: ${BORDER_RADIUS}px;
`

const InputContainer = styled.View`
  position: relative;
  flex: 1;
`

const TextInputStyled = styled.TextInput<{ hide?: boolean }>`
  height: 100%;
  padding-top: 12px;
  color: ${({ theme }) => theme.font.primary};
  font-size: 15px;

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
`

const Label = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
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

const ErrorContainer = styled(Animated.View)`
  position: absolute;
  bottom: -10px;
  right: -5px;
  padding: 5px;
  background: ${({ theme }) => theme.bg.highlight};
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.primary};
  border-radius: 100px;
`

const Error = styled(AppText)`
  color: ${({ theme }) => theme.global.alert};

  font-size: 11px;
`
