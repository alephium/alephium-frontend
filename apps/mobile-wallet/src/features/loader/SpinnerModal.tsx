import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import { ActivityIndicator } from 'react-native'
import { Circle as ProgressBar } from 'react-native-progress'
import styled, { DefaultTheme, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'

type FontColor = keyof DefaultTheme['font']

interface SpinnerProps {
  text?: string
  bg?: 'faded' | 'full'
  color?: FontColor
  progress?: number
  animated?: boolean
}

interface SpinnerModalProps extends SpinnerProps {
  isActive: boolean
  blur?: boolean
}

const SpinnerModal = ({ isActive, text, blur = true, bg, progress }: SpinnerModalProps) => {
  const theme = useTheme()

  return (
    <ModalWithBackdrop animationType="fade" visible={isActive}>
      {blur ? (
        <BlurView tint={theme.name} intensity={30} style={{ flex: 1, width: '100%' }}>
          <Spinner bg={bg} text={text} color="primary" progress={progress} />
        </BlurView>
      ) : (
        <Spinner
          bg={bg}
          text={text}
          color={bg === 'full' ? 'secondary' : theme.name === 'dark' ? 'secondary' : 'contrast'}
          progress={progress}
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
        <LoadingText semiBold size={16} color={color}>
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
