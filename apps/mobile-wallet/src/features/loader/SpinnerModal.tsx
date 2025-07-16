import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { Circle as ProgressBar } from 'react-native-progress'
import styled, { DefaultTheme, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import { LoaderConfig } from '~/features/loader/loaderTypes'

type FontColor = keyof DefaultTheme['font']

interface SpinnerProps extends Omit<LoaderConfig, 'blur'> {
  color?: FontColor
  progress?: number
  animated?: boolean
}

type SpinnerModalProps = SpinnerProps & LoaderConfig

const SpinnerModal = ({ text, blur = true, bg = 'faded', progress, minDurationMs }: SpinnerModalProps) => {
  const theme = useTheme()

  const [config, setConfig] = useState({ text, bg, blur, progress, minDurationMs })
  const minDurationMsRef = useRef(minDurationMs)

  useEffect(() => {
    if (text) {
      setConfig({ text, bg, blur, progress, minDurationMs })
      minDurationMsRef.current = minDurationMs
    } else {
      const timeout = setTimeout(() => {
        setConfig({ text, bg, blur, progress, minDurationMs })
      }, minDurationMsRef.current || 300)

      return () => clearTimeout(timeout)
    }
  }, [bg, blur, minDurationMs, progress, text])

  return (
    <ModalWithBackdrop animationType="fade" visible={!!config.text}>
      {blur ? (
        <BlurView tint={theme.name} intensity={30} style={{ flex: 1, width: '100%' }}>
          <Spinner bg={config.bg} text={config.text} color="primary" progress={config.progress} />
        </BlurView>
      ) : (
        <Spinner
          bg={config.bg}
          text={config.text}
          color={config.bg === 'full' ? 'secondary' : theme.name === 'dark' ? 'secondary' : 'contrast'}
          progress={config.progress}
        />
      )}
    </ModalWithBackdrop>
  )
}

export default SpinnerModal

export const Spinner = ({ text, color = 'tertiary', animated = true, bg, progress }: SpinnerProps) => {
  const theme = useTheme()

  return (
    <SpinnerStyled bg={bg}>
      {progress !== undefined ? (
        <ProgressBar
          progress={progress}
          color={theme.font.primary}
          size={100}
          thickness={6}
          strokeCap="round"
          unfilledColor={theme.bg.primary}
          borderWidth={0}
          animated={animated}
        />
      ) : (
        <ActivityIndicator size={72} color={theme.font[color]} />
      )}
      {text && (
        <LoadingText semiBold size={20} color={color}>
          {text}
        </LoadingText>
      )}
    </SpinnerStyled>
  )
}

const SpinnerStyled = styled.View<{ bg?: SpinnerProps['bg'] }>`
  flex: 1;
  width: 100%;
  background-color: ${({ theme, bg }) =>
    bg === 'faded' ? colord(theme.bg.contrast).alpha(0.3).toRgbString() : bg === 'full' ? theme.bg.back1 : undefined};
  justify-content: center;
  align-items: center;
`

const LoadingText = styled(AppText)`
  margin-top: 50px;
`
