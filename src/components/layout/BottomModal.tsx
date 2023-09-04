/*
Copyright 2018 - 2022 The Alephium Authors
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

import { X } from 'lucide-react-native'
import React, { ReactNode, useEffect, useState } from 'react'
import { Dimensions, LayoutChangeEvent } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { ModalContentProps } from '~/components/layout/ModalContent'
import { VERTICAL_GAP } from '~/style/globalStyle'

type ModalPositions = 'minimised' | 'maximised' | 'closing'

const NAV_HEIGHT = 48
const DRAG_BUFFER = 40

const springConfig: WithSpringConfig = {
  damping: 50,
  mass: 0.3,
  stiffness: 120,
  overshootClamping: true,
  restSpeedThreshold: 0.3,
  restDisplacementThreshold: 0.3
}

interface BottomModalProps {
  Content: (props: ModalContentProps) => ReactNode
  isOpen: boolean
  onClose: () => void
  isScrollable?: boolean
}

const BottomModal = ({ Content, isOpen, onClose, isScrollable }: BottomModalProps) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'))
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })
    return () => subscription?.remove()
  }, [])

  const contentHeight = useSharedValue(0)

  const maxHeight = dimensions.height

  const minHeight = useSharedValue(0)
  const modalHeight = useSharedValue(0)
  const position = useSharedValue<ModalPositions>('minimised')
  const navHeight = useSharedValue(0)
  const offsetY = useSharedValue(0)

  const modalHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: -modalHeight.value,
    paddingTop:
      position.value === 'maximised' ? insets.top : position.value === 'closing' ? withSpring(0, springConfig) : 20
  }))

  const modalNavigationAnimatedStyle = useAnimatedStyle(() => ({
    height: navHeight.value,
    overflow: 'hidden'
  }))

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(-modalHeight.value, [0, dimensions.height], [0, 1]),
    pointerEvents: position.value === 'closing' ? 'none' : 'auto'
  }))

  const handleContentLayout = (e: LayoutChangeEvent) => {
    const newContentHeight = e.nativeEvent.layout.height

    if (!modalHeight.value || newContentHeight > contentHeight.value + 1) {
      // 👆 Add one to avoid floating point issues

      runOnUI(() => {
        contentHeight.value = newContentHeight
        minHeight.value = contentHeight.value + NAV_HEIGHT + insets.bottom + VERTICAL_GAP
        modalHeight.value = withSpring(-minHeight.value, springConfig)
        position.value = 'minimised'
      })()
    }
  }

  const handleClose = () => {
    position.value = 'closing'
    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(0, springConfig, (finished) => finished && runOnJS(onClose)())
  }

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      offsetY.value = modalHeight.value
    })
    .onChange((e) => {
      modalHeight.value = offsetY.value + e.translationY
    })
    .onEnd(() => {
      const shouldMinimise = position.value === 'maximised' && -modalHeight.value < dimensions.height - DRAG_BUFFER

      const shouldMaximise = position.value === 'minimised' && -modalHeight.value > minHeight.value + DRAG_BUFFER

      const shouldClose = position.value === 'minimised' && -modalHeight.value < minHeight.value - DRAG_BUFFER

      if (shouldMaximise) {
        navHeight.value = withSpring(NAV_HEIGHT + 10, springConfig)
        modalHeight.value = withSpring(-maxHeight, springConfig)
        position.value = 'maximised'
      } else if (shouldMinimise) {
        navHeight.value = withSpring(0, springConfig)
        modalHeight.value = withSpring(-minHeight.value, springConfig)
        position.value = 'minimised'
      } else if (shouldClose) {
        runOnJS(handleClose)()
      } else {
        modalHeight.value =
          position.value === 'maximised'
            ? withSpring(-maxHeight, springConfig)
            : withSpring(-minHeight.value, springConfig)
      }
    })

  return isOpen ? (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={{ flex: 1 }}>
        <Backdrop style={backdropAnimatedStyle} />
        <Container>
          <BottomModalStyled style={modalHeightAnimatedStyle}>
            <HandleContainer>
              <Handle />
            </HandleContainer>
            <ContentContainer>
              <Navigation style={modalNavigationAnimatedStyle}>
                <Button onPress={handleClose} Icon={X} round />
              </Navigation>
              <Content onLayout={handleContentLayout} />
            </ContentContainer>
          </BottomModalStyled>
        </Container>
      </Animated.View>
    </GestureDetector>
  ) : null
}

export default BottomModal

const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

const Backdrop = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
`

const BottomModalStyled = styled(Animated.View)`
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  min-height: 80px;
`

const HandleContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding-top: 10px;
`

const Handle = styled.View`
  width: 15%;
  height: 4px;
  border-radius: 8px;
  background-color: #cccccc;
`

const Navigation = styled(Animated.View)`
  align-items: flex-end;
`

const ContentContainer = styled(Animated.View)`
  flex: 1;
  padding: 0 20px;
`
