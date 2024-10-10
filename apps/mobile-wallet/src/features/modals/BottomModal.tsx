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

import { ReactNode } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView, StyleProp, ViewStyle } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { CloseButton } from '~/components/buttons/Button'
import { useBottomModalState } from '~/features/modals/useBottomModalState'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface BottomModalProps {
  modalId: number
  children: ReactNode
  onClose?: () => void
  title?: string
  maximisedContent?: boolean
  minHeight?: number
  navHeight?: number
  noPadding?: boolean
  contentVerticalGap?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
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
  const {
    modalHeightAnimatedStyle,
    handleAnimatedStyle,
    backdropAnimatedStyle,
    handleContentSizeChange,
    panGesture,
    handleClose,
    contentScrollHandlers,
    isScrollable
  } = useBottomModalState({
    modalId,
    maximisedContent,
    minHeight,
    navHeight,
    onClose
  })

  return (
    <GestureDetector gesture={panGesture}>
      <KeyboardAvoidingViewStyled behavior="height" enabled={!maximisedContent}>
        <Backdrop style={backdropAnimatedStyle} onPress={handleClose} />
        <Container>
          <ModalStyled style={modalHeightAnimatedStyle}>
            <HandleContainer>
              <Handle style={handleAnimatedStyle} />
            </HandleContainer>
            <Navigation style={{ height: navHeight }}>
              <NavigationButtonContainer align="left" />
              <Title semiBold>{title}</Title>
              <NavigationButtonContainer align="right">
                <CloseButton onPress={handleClose} compact />
              </NavigationButtonContainer>
            </Navigation>
            <AnimatedScrollView
              onContentSizeChange={handleContentSizeChange}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={isScrollable}
              scrollEventThrottle={16}
              contentContainerStyle={[
                contentContainerStyle,
                {
                  gap: contentVerticalGap ? VERTICAL_GAP : undefined,
                  padding: noPadding ? 0 : DEFAULT_MARGIN
                }
              ]}
              {...contentScrollHandlers}
            >
              {children}
            </AnimatedScrollView>
          </ModalStyled>
        </Container>
      </KeyboardAvoidingViewStyled>
    </GestureDetector>
  )
}

export default BottomModal

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
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.back1 : theme.bg.secondary)};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  min-height: 80px;
  overflow: hidden;
`

const HandleContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding-top: 5px;
`

const Handle = styled(Animated.View)`
  width: 15%;
  height: 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.border.primary};
  margin-top: -15px;
`

const Title = styled(AppText)`
  flex: 1;
  text-align: center;
`

const Navigation = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${DEFAULT_MARGIN - 1}px;
`

const NavigationButtonContainer = styled.View<{ align: 'right' | 'left' }>`
  width: 10%;
  flex-direction: row;
  justify-content: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
`