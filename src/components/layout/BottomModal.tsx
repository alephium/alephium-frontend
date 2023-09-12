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

import React, { ReactNode, useEffect, useState } from 'react'
import { Dimensions, LayoutChangeEvent, Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
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
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

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
  scrollableContent?: boolean
  customMinHeight?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const BottomModal = ({ Content, isOpen, onClose, scrollableContent, customMinHeight }: BottomModalProps) => {
  const insets = useSafeAreaInsets()

  const [dimensions, setDimensions] = useState(Dimensions.get('window'))

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })

    return () => subscription?.remove()
  }, [])

  const contentHeight = useSharedValue(0)

  const maxHeight = dimensions.height

  const minHeight = useSharedValue(customMinHeight || 0)
  const modalHeight = useSharedValue(0)
  const position = useSharedValue<ModalPositions>('minimised')
  const navHeight = useSharedValue(0)
  const offsetY = useSharedValue(0)

  const canMaximize = useSharedValue(false)

  const modalHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: -modalHeight.value,
    paddingTop:
      position.value === 'maximised' ? insets.top : position.value === 'closing' ? withSpring(0, springConfig) : 20,
    marginRight: interpolate(-modalHeight.value, [minHeight.value, dimensions.height], [5, 0], Extrapolate.CLAMP),
    marginLeft: interpolate(-modalHeight.value, [minHeight.value, dimensions.height], [5, 0], Extrapolate.CLAMP)
  }))

  const modalNavigationAnimatedStyle = useAnimatedStyle(() => ({
    height: navHeight.value,
    overflow: 'hidden'
  }))

  const handleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scrollableContent ? 0 : interpolate(-modalHeight.value, [0, minHeight.value, dimensions.height], [0, 1, 0])
  }))

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(-modalHeight.value, [0, dimensions.height], [0, 1]),
    pointerEvents: position.value === 'closing' ? 'none' : 'auto'
  }))

  const handleContentLayout = (e: LayoutChangeEvent) => {
    const newContentHeight = e.nativeEvent.layout.height

    if (!modalHeight.value || newContentHeight > contentHeight.value + 1) {
      // 👆 Add one to avoid floating point issues

      // 👇 This is where we initiate the layout main values based on children height
      runOnUI(() => {
        contentHeight.value = newContentHeight
        canMaximize.value = contentHeight.value > 0.3 * dimensions.height

        minHeight.value = customMinHeight
          ? customMinHeight
          : scrollableContent
          ? maxHeight
          : canMaximize.value
          ? dimensions.height * 0.3
          : contentHeight.value + NAV_HEIGHT + insets.bottom + VERTICAL_GAP

        scrollableContent ? handleMaximize() : handleMinimize()
      })()
    }
  }

  const handleClose = () => {
    'worklet'

    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(0, springConfig, (finished) => finished && runOnJS(onClose)())
    position.value = 'closing'
  }

  const handleMaximize = () => {
    'worklet'

    navHeight.value = withSpring(NAV_HEIGHT + 10, springConfig)
    modalHeight.value = withSpring(-maxHeight, springConfig)
    position.value = 'maximised'
  }

  const handleMinimize = () => {
    'worklet'

    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(-minHeight.value, springConfig)
    position.value = 'minimised'
  }

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      offsetY.value = modalHeight.value
    })
    .onChange((e) => {
      if (position.value !== 'closing') {
        modalHeight.value = offsetY.value + e.translationY
      }
    })
    .onEnd(() => {
      const shouldMinimise = position.value === 'maximised' && -modalHeight.value < dimensions.height - DRAG_BUFFER

      const shouldMaximise =
        canMaximize.value && position.value === 'minimised' && -modalHeight.value > minHeight.value + DRAG_BUFFER

      const shouldClose =
        ['minimised', 'closing'].includes(position.value) && -modalHeight.value < minHeight.value - DRAG_BUFFER

      if (shouldMaximise) {
        handleMaximize()
      } else if (shouldMinimise) {
        scrollableContent ? handleClose() : handleMinimize()
      } else if (shouldClose) {
        handleClose()
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
        <Backdrop style={backdropAnimatedStyle} onPress={handleClose} />
        <Container>
          <BottomModalStyled style={modalHeightAnimatedStyle}>
            <HandleContainer>
              <Handle style={handleAnimatedStyle} />
            </HandleContainer>
            <ContentContainer>
              <Navigation style={modalNavigationAnimatedStyle}>
                <Button onPress={handleClose} iconProps={{ name: 'close-outline' }} round />
              </Navigation>
              <Content onLayout={handleContentLayout} onClose={handleClose} />
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

const Backdrop = styled(AnimatedPressable)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
`

const BottomModalStyled = styled(Animated.View)`
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.bg.primary};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  min-height: 80px;
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

const Navigation = styled(Animated.View)`
  align-items: flex-end;
`

const ContentContainer = styled(Animated.View)`
  flex: 1;
  padding: 0 ${DEFAULT_MARGIN}px;
`
