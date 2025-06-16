import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { Circle as ProgressBar } from 'react-native-progress'
import styled, { DefaultTheme, useTheme } from 'styled-components/native'

import successAnimationSrc from '~/animations/lottie/success.json'
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

const SpinnerModal = ({ isActive, text, blur = false, bg = 'full', progress }: SpinnerModalProps) => {
  const theme = useTheme()

  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isActive) {
      setShouldRender(true)
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 300)

      return () => clearTimeout(timeout)
    }
  }, [isActive])

  if (!shouldRender) return null

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
        // TODO: Show a more appropriate cool animation? I like the confetti tbh! This is so much more fun!
        <StyledAnimation source={successAnimationSrc} autoPlay />
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

const StyledAnimation = styled(LottieView)`
  width: 100%;
  height: 50%;
`
