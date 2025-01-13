import { getStringAsync } from 'expo-clipboard'
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, TextInput, TextInputProps, ViewProps, ViewStyle } from 'react-native'
import Animated, { AnimatedProps, FadeIn, FadeOut } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { INPUTS_HEIGHT } from '~/style/globalStyle'

export type InputValue = string | number | undefined | unknown
export type RenderValueFunc<T> = T extends InputValue ? (value: T) => ReactNode : never

export interface InputProps<T extends InputValue> extends Omit<TextInputProps, 'value'> {
  value: T
  label: string
  onPress?: () => void
  resetDisabledColor?: boolean
  RightContent?: ReactNode
  renderValue?: RenderValueFunc<T>
  showPasteButton?: boolean
  short?: boolean
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
  showPasteButton,
  short,
  error,
  layout,
  inputRef,
  onChangeText,
  ...props
}: InputProps<T>) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [copiedText, setCopiedText] = useState('')
  const localInputRef = useRef<TextInput>(null)
  const usedInputRef = inputRef || localInputRef

  const renderedValue = renderValue ? renderValue(value) : value ? (value as object).toString() : ''
  const showCustomValueRendering = typeof renderedValue !== 'string' && renderedValue !== undefined

  useEffect(() => {
    getStringAsync().then(setCopiedText)
  }, [])

  const handlePasteButtonPress = () => {
    usedInputRef.current?.setNativeProps({ text: copiedText })
    onChangeText?.(copiedText)
  }

  const isShowingPasteButton = copiedText && showPasteButton

  return (
    <InputStyled onPress={onPress} style={style} short={short}>
      <InputContainer>
        {showCustomValueRendering && <CustomRenderedValue>{renderedValue}</CustomRenderedValue>}
        <TextInputStyled
          selectionColor={theme.global.accent}
          value={renderedValue?.toString()}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={usedInputRef}
          placeholder={label}
          forwardedAs={TextInput}
          placeholderTextColor={theme.font.tertiary}
          style={resetDisabledColor && !props.editable ? { color: theme.font.primary } : undefined}
          hide={showCustomValueRendering}
          onChangeText={onChangeText}
          {...props}
        />
        {isShowingPasteButton && (
          <PasteButtonContainer>
            <Button compact onPress={handlePasteButtonPress} variant="contrast" title={t('Paste')} />
          </PasteButtonContainer>
        )}
      </InputContainer>
      {RightContent}
      {error && (
        <ErrorContainer entering={FadeIn} exiting={FadeOut}>
          <Error>{error}</Error>
        </ErrorContainer>
      )}
    </InputStyled>
  )
}

export default Input

const InputStyled = styled.Pressable<{ short?: boolean }>`
  min-width: 150px;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-radius: 100px;
  padding: 0 18px;
  height: ${({ short }) => INPUTS_HEIGHT / (short ? 1.2 : 1)}px;
`

const InputContainer = styled.View`
  flex-direction: row;
  flex: 1;
  gap: 5px;
`

const TextInputStyled = styled.TextInput<{ hide?: boolean }>`
  flex: 1;
  height: 100%;
  color: ${({ theme }) => theme.font.primary};
  font-size: 15px;

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
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
  bottom: -22px;
  right: 0px;
  padding: 5px;
`

const Error = styled(AppText)`
  color: ${({ theme }) => theme.global.alert};

  font-size: 11px;
`

const PasteButtonContainer = styled.View`
  align-items: center;
  justify-content: center;
`
