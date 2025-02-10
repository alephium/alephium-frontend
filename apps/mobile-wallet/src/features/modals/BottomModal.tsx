import { useEffect } from 'react'
import { ScrollView, StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'

import BottomModalBase, { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import { BottomModalAnimationStates, useBottomModalState } from '~/features/modals/useBottomModalState'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface BottomModalProps extends BottomModalBaseProps {
  contentContainerStyle?: StyleProp<ViewStyle>
  onModalAnimationStateChange?: (state: BottomModalAnimationStates) => void
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

const BottomModal = ({
  modalId,
  children,
  onClose,
  title,
  titleAlign,
  maximisedContent,
  minHeight,
  navHeight = 50,
  noPadding,
  contentVerticalGap,
  contentContainerStyle,
  onModalAnimationStateChange
}: BottomModalProps) => {
  const modalState = useBottomModalState({
    modalId,
    maximisedContent,
    minHeight,
    navHeight,
    onClose
  })

  useEffect(() => {
    onModalAnimationStateChange?.(modalState.modalAnimationState)
  }, [modalState.modalAnimationState, onModalAnimationStateChange])

  return (
    <BottomModalBase modalId={modalId} title={title} navHeight={navHeight} titleAlign={titleAlign} {...modalState}>
      <AnimatedScrollView
        onContentSizeChange={modalState.handleContentSizeChange}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={modalState.isContentScrollable}
        scrollEventThrottle={16}
        contentContainerStyle={[
          contentContainerStyle,
          {
            gap: contentVerticalGap ? VERTICAL_GAP : undefined,
            padding: noPadding ? 0 : DEFAULT_MARGIN
          }
        ]}
      >
        {children}
      </AnimatedScrollView>
    </BottomModalBase>
  )
}

export default BottomModal
