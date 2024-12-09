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
  maximisedContent,
  minHeight,
  navHeight = 50,
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
    <BottomModalBase modalId={modalId} title={title} navHeight={navHeight} {...modalState}>
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
        {...modalState.contentScrollHandlers}
      >
        {children}
      </AnimatedScrollView>
    </BottomModalBase>
  )
}

export default BottomModal
