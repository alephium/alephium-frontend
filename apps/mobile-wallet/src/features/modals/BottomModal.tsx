// HUGE THANKS TO JAI-ADAPPTOR @ https://gist.github.com/jai-adapptor/bc3650ab20232d8ab076fa73829caebb

import { ScrollView, StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'

import BottomModalBase, { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import { useBottomModalState } from '~/features/modals/useBottomModalState'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface BottomModalProps extends BottomModalBaseProps {
  contentContainerStyle?: StyleProp<ViewStyle>
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
  paddingTop,
  noPadding,
  contentVerticalGap,
  contentContainerStyle
}: BottomModalProps) => {
  const modalState = useBottomModalState({
    modalId,
    maximisedContent,
    minHeight,
    navHeight,
    onClose
  })

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
            padding: noPadding ? 0 : DEFAULT_MARGIN,
            paddingTop: paddingTop ? VERTICAL_GAP : 0
          }
        ]}
        {...modalState.contentScrollHandlers}
      >
        {children}
      </AnimatedScrollView>
    </BottomModalBase>
  )
}

export default BottomModal
