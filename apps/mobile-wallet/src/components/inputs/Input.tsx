import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import * as Clipboard from 'expo-clipboard'
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, TextInputProps, ViewProps, ViewStyle } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, { AnimatedProps, FadeIn, FadeOut } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { INPUTS_HEIGHT } from '~/style/globalStyle'

export interface InputProps extends Omit<TextInputProps, 'style' | 'value'> {
  label: string
  onPress?: () => void
  resetDisabledColor?: boolean
  RightContent?: ReactNode
  showPasteButton?: boolean
  short?: boolean
  error?: string
  style?: StyleProp<ViewStyle>
  layout?: AnimatedProps<ViewProps>['layout']
  inputRef?: RefObject<TextInput>
  isInModal?: boolean
}

const Input = ({
  label,
  style,
  onPress,
  onFocus,
  onBlur,
  resetDisabledColor,
  RightContent,
  showPasteButton,
  short,
  error,
  layout,
  inputRef,
  onChangeText,
  isInModal,
  ...props
}: InputProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [copiedText, setCopiedText] = useState('')
  const localInputRef = useRef<TextInput>(null)
  const usedInputRef = inputRef || localInputRef

  useEffect(() => {
    Clipboard.hasStringAsync().then((has) => {
      if (has) {
        Clipboard.getStringAsync().then(setCopiedText)
      }
    })
  }, [])

  const handlePasteButtonPress = () => {
    usedInputRef.current?.setNativeProps({ text: copiedText })
    onChangeText?.(copiedText)
  }

  const isShowingPasteButton = copiedText && showPasteButton
  const TextInputComponent = isInModal ? BottomSheetTextInputStyled : TextInputStyled

  const handleChangeText = (text: string) => {
    usedInputRef.current?.setNativeProps({ value: text })
    onChangeText?.(text)
  }

  return (
    <InputStyled onPress={onPress} style={style} short={short}>
      <InputContainer>
        <TextInputComponent
          selectionColor={theme.global.accent}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={usedInputRef}
          placeholder={label}
          placeholderTextColor={theme.font.tertiary}
          style={resetDisabledColor && !props.editable ? { color: theme.font.primary } : undefined}
          onChangeText={handleChangeText}
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
  padding: 0 14px 0 18px;
  height: ${({ short }) => INPUTS_HEIGHT / (short ? 1.2 : 1)}px;
`

const InputContainer = styled.View`
  flex-direction: row;
  flex: 1;
  gap: 5px;
`

const InputStyles = css`
  flex: 1;
  height: 100%;
  color: ${({ theme }) => theme.font.primary};
  font-size: 15px;
`

const TextInputStyled = styled.TextInput<{ hide?: boolean }>`
  ${InputStyles};

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
`

const BottomSheetTextInputStyled = styled(BottomSheetTextInput)<{ hide?: boolean }>`
  ${InputStyles};

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
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
