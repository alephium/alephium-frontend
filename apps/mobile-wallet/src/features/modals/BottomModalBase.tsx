import { ReactNode, useEffect } from 'react'
import { BackHandler, KeyboardAvoidingView, KeyboardAvoidingViewProps, Pressable, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import BottomModalHandle from '~/features/modals/BottomModalHandle'
import BottomModalHeader from '~/features/modals/BottomModalHeader'
import { useBottomModalState } from '~/features/modals/useBottomModalState'

export interface BottomModalBaseProps {
  children: ReactNode
  onClose?: () => void
  title?: string | ReactNode
  titleAlign?: 'left' | 'center'
  titleButton?: ReactNode
  maximisedContent?: boolean
  minHeight?: number
  noPadding?: boolean
  contentVerticalGap?: boolean
  navHeight?: number
  keyboardAvoidingViewBehavior?: KeyboardAvoidingViewProps['behavior']
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const BottomModalBase = ({
  maximisedContent,
  backdropAnimatedStyle,
  handleClose,
  modalAnimatedStyle,
  handleAnimatedStyle,
  panGesture,
  navHeight,
  title,
  titleAlign,
  isContentScrollable,
  children,
  titleButton,
  keyboardAvoidingViewBehavior = 'height'
}: BottomModalBaseProps & ReturnType<typeof useBottomModalState>) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose()

      return true
    })

    return () => backHandler.remove()
  }, [handleClose])

  return (
    <KeyboardAvoidingViewStyled behavior={keyboardAvoidingViewBehavior} enabled={!maximisedContent}>
      <Backdrop style={backdropAnimatedStyle} onPress={handleClose} />
      <Container>
        <ModalStyled style={modalAnimatedStyle}>
          <BottomModalHandle style={handleAnimatedStyle} />

          <GestureDetector gesture={panGesture}>
            <View style={{ flex: !isContentScrollable ? 1 : 0 }}>
              <BottomModalHeader
                title={title}
                height={navHeight}
                onClose={handleClose}
                titleAlign={titleAlign}
                showCloseButton={isContentScrollable}
                rightButton={titleButton}
              />
              {!isContentScrollable && children}
            </View>
          </GestureDetector>
          {isContentScrollable && children}
        </ModalStyled>
      </Container>
    </KeyboardAvoidingViewStyled>
  )
}

export default BottomModalBase

const KeyboardAvoidingViewStyled = styled(KeyboardAvoidingView)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
`

const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

const Backdrop = styled(AnimatedPressable)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
`

const ModalStyled = styled(Animated.View)`
  justify-content: flex-start;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  min-height: 80px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.back1};
`
