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
import { Dimensions, SafeAreaView, Text, TouchableOpacity } from 'react-native'
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig
} from 'react-native-reanimated'
import styled from 'styled-components/native'

interface SheetProps {
  children: ReactNode
  minHeight?: number
  maxHeight?: number
  expandedHeight?: number
}

type SheetPositions = 'minimised' | 'maximised' | 'expanded'

const NAV_HEIGHT = 48
const DRAG_BUFFER = 40

const Sheet: React.FC<SheetProps> = (props) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'))

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })
    return () => subscription?.remove()
  }, [])

  const minHeight = props.minHeight || 120
  const maxHeight = props.maxHeight || dimensions.height
  const expandedHeight = props.expandedHeight || dimensions.height * 0.6

  const position = useSharedValue<SheetPositions>('minimised')
  const sheetHeight = useSharedValue(-minHeight)
  const navHeight = useSharedValue(0)

  const springConfig: WithSpringConfig = {
    damping: 50,
    mass: 0.3,
    stiffness: 120,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3
  }

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_ev, ctx: any) => {
      ctx.offsetY = sheetHeight.value
    },
    onActive: (ev, ctx: any) => {
      sheetHeight.value = ctx.offsetY + ev.translationY
    },
    onEnd: () => {
      'worklet'

      const shouldExpand =
        (position.value === 'maximised' && -sheetHeight.value < maxHeight - DRAG_BUFFER) ||
        (position.value === 'minimised' && -sheetHeight.value > minHeight + DRAG_BUFFER)

      const shouldMinimise = position.value === 'expanded' && -sheetHeight.value < expandedHeight - DRAG_BUFFER

      const shouldMaximise = position.value === 'expanded' && -sheetHeight.value > expandedHeight + DRAG_BUFFER

      if (shouldExpand) {
        navHeight.value = withSpring(0, springConfig)
        sheetHeight.value = withSpring(-expandedHeight, springConfig)
        position.value = 'expanded'
      } else if (shouldMaximise) {
        navHeight.value = withSpring(NAV_HEIGHT + 10, springConfig)
        sheetHeight.value = withSpring(-maxHeight, springConfig)
        position.value = 'maximised'
      } else if (shouldMinimise) {
        navHeight.value = withSpring(0, springConfig)
        sheetHeight.value = withSpring(-minHeight, springConfig)
        position.value = 'minimised'
      } else {
        sheetHeight.value = withSpring(
          position.value === 'expanded' ? -expandedHeight : position.value === 'maximised' ? -maxHeight : -minHeight,
          springConfig
        )
      }
    }
  })

  const sheetHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: -sheetHeight.value
  }))

  const sheetContentAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: position.value === 'maximised' ? 180 : 0,
    paddingTop: position.value === 'maximised' ? 40 : 20,
    paddingHorizontal: 20
  }))

  const sheetNavigationAnimatedStyle = useAnimatedStyle(() => ({
    height: navHeight.value,
    overflow: 'hidden'
  }))

  return (
    <>
      <Backdrop />
      <Container>
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <SheetStyled style={sheetHeightAnimatedStyle}>
            <HandleContainer>
              <Handle />
            </HandleContainer>
            <Animated.View style={sheetContentAnimatedStyle}>
              <Animated.View style={sheetNavigationAnimatedStyle}>
                <CloseButton
                  onPress={() => {
                    navHeight.value = withSpring(0, springConfig)
                    sheetHeight.value = withSpring(-expandedHeight, springConfig)
                    position.value = 'expanded'
                  }}
                >
                  <Text>{`❌`}</Text>
                </CloseButton>
              </Animated.View>
              <SafeAreaView>
                <ScrollView>{props.children}</ScrollView>
              </SafeAreaView>
            </Animated.View>
          </SheetStyled>
        </PanGestureHandler>
      </Container>
    </>
  )
}

export default Sheet

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
  background-color: rgba(0, 0, 0, 0.2);
`

const SheetStyled = styled(Animated.View)`
  justify-content: flex-start;
  background-color: #ffffff;
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

const CloseButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  border-radius: 48px;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  margin-bottom: 10px;
`
