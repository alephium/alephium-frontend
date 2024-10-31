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

import { ReactNode } from 'react'
import { KeyboardAvoidingView, Pressable, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import BottomModalHeader from '~/features/modals/BottomModalHeader'
import { useBottomModalState } from '~/features/modals/useBottomModalState'

export interface BottomModalBaseProps {
  modalId: number
  children: ReactNode
  onClose?: () => void
  title?: string
  maximisedContent?: boolean
  minHeight?: number
  noPadding?: boolean
  contentVerticalGap?: boolean
  navHeight?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const BottomModalBase = ({
  maximisedContent,
  backdropAnimatedStyle,
  handleClose,
  modalHeightAnimatedStyle,
  handleAnimatedStyle,
  panGesture,
  navHeight,
  title,
  isContentScrollable,
  children
}: BottomModalBaseProps & ReturnType<typeof useBottomModalState>) => (
  <KeyboardAvoidingViewStyled behavior="height" enabled={!maximisedContent}>
    <Backdrop style={backdropAnimatedStyle} onPress={handleClose} />
    <Container>
      <ModalStyled style={modalHeightAnimatedStyle}>
        <HandleContainer>
          <Handle style={handleAnimatedStyle} />
        </HandleContainer>
        <GestureDetector gesture={panGesture}>
          <View>
            <BottomModalHeader title={title} height={navHeight} handleClose={handleClose} />
            {!isContentScrollable && children}
          </View>
        </GestureDetector>
        {isContentScrollable && children}
      </ModalStyled>
    </Container>
  </KeyboardAvoidingViewStyled>
)

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
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.highlight : theme.bg.primary)};
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
