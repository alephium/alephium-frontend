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
import { useCallback, useEffect, useState } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, Platform, useWindowDimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { interpolate, runOnJS, runOnUI, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { removeModal } from '~/features/modals/modalActions'
import { selectModalById } from '~/features/modals/modalSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

type BottomModalPositions = 'minimised' | 'maximised' | 'closing'

export interface UseBottomModalStateParams {
  modalId: number
  navHeight: number
  maximisedContent?: boolean
  minHeight?: number
  onClose?: () => void
}

export interface ContentScrollHandlers {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  onScrollBeginDrag: () => void
  onScrollEndDrag: () => void
}

const springConfig = {
  damping: 50,
  mass: 0.3,
  stiffness: 120,
  overshootClamping: true,
  restSpeedThreshold: 0.3,
  restDisplacementThreshold: 0.3
}

const DRAG_BUFFER = 40

export const useBottomModalState = ({
  modalId,
  maximisedContent,
  minHeight: customMinHeight,
  navHeight: customNavHeight,
  onClose
}: UseBottomModalStateParams) => {
  const insets = useSafeAreaInsets()
  const dimensions = useWindowDimensions()
  const dispatch = useAppDispatch()
  const maxHeight = dimensions.height - insets.top

  // Initialize shared values
  // ----------------------------
  const modalHeight = useSharedValue(0)
  const position = useSharedValue<BottomModalPositions>('minimised')
  const navHeight = useSharedValue(0)
  const minHeight = useSharedValue(customMinHeight || 0)
  const shouldMaximizeOnOpen = useSharedValue(!!maximisedContent)
  const contentHeight = useSharedValue(0)
  const canMaximize = useSharedValue(false)

  const contentScrollY = useSharedValue(0)
  const previousContentScrollY = useSharedValue(0)
  const isContentDragged = useSharedValue(false)
  const modalHeightDelta = useSharedValue(0)

  const offsetY = useSharedValue(0)

  const [isContentScrollable, setIsContentScrollable] = useState(false)

  const isModalClosing = useAppSelector((s) => selectModalById(s, modalId)?.isClosing)

  // Handlers
  // ----------------------------
  const handleCloseOnJS = useCallback(() => {
    if (onClose) onClose()

    dispatch(removeModal({ id: modalId })) // Remove modal from stack after animation is done
  }, [dispatch, modalId, onClose])

  const handleClose = useCallback(() => {
    'worklet'

    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(0, springConfig, (finished) => finished && runOnJS(handleCloseOnJS)())
    position.value = 'closing'
  }, [handleCloseOnJS, modalHeight, navHeight, position])

  const handleMaximize = useCallback(() => {
    'worklet'
    navHeight.value = withSpring(customNavHeight, springConfig)
    modalHeight.value = withSpring(-maxHeight, springConfig)
    position.value = 'maximised'
  }, [navHeight, customNavHeight, modalHeight, maxHeight, position])

  const handleMinimize = useCallback(() => {
    'worklet'
    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(-minHeight.value, springConfig)
    position.value = 'minimised'
  }, [navHeight, modalHeight, minHeight, position])

  const handleContentSizeChange = useCallback(
    (_w: number, newContentHeight: number) => {
      if (!modalHeight.value || newContentHeight > contentHeight.value + 1) {
        runOnUI(() => {
          contentHeight.value = newContentHeight
          canMaximize.value = contentHeight.value > maxHeight
          const contentIsScrollable = contentHeight.value > dimensions.height * 0.9

          shouldMaximizeOnOpen.value = maximisedContent || contentIsScrollable

          // Determine if scrolling is needed
          runOnJS(setIsContentScrollable)(contentIsScrollable)

          minHeight.value = customMinHeight
            ? customMinHeight
            : shouldMaximizeOnOpen.value
              ? maxHeight
              : contentHeight.value + customNavHeight + (Platform.OS === 'ios' ? insets.bottom : insets.bottom + 18)

          shouldMaximizeOnOpen.value ? handleMaximize() : handleMinimize()
        })()
      }
    },
    [
      modalHeight.value,
      contentHeight,
      canMaximize,
      maxHeight,
      shouldMaximizeOnOpen,
      maximisedContent,
      minHeight,
      customMinHeight,
      customNavHeight,
      insets.bottom,
      handleMaximize,
      handleMinimize,
      dimensions.height
    ]
  )

  // Content scroll handlers
  const contentScrollHandlers: ContentScrollHandlers = {
    onScroll: (e) => {
      contentScrollY.value = e.nativeEvent.contentOffset.y

      if (!isContentDragged.value) return

      if (contentScrollY.value <= 5) {
        // Move the modal
        if (contentScrollY.value < previousContentScrollY.value) {
          const newModalHeightValue = modalHeight.value - contentScrollY.value
          modalHeightDelta.value = modalHeight.value - newModalHeightValue
          modalHeight.value = newModalHeightValue
        }
      } else if (-modalHeight.value < maxHeight) {
        handleMaximize()
      }
      previousContentScrollY.value = contentScrollY.value
    },
    onScrollBeginDrag: () => {
      isContentDragged.value = true
    },
    onScrollEndDrag: () => {
      isContentDragged.value = false

      if (modalHeightDelta.value < -1) {
        handleClose()
      }
    }
  }

  // Animated Styles
  // ----------------------------
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    height: -modalHeight.value
  }))

  const handleAnimatedStyle = useAnimatedStyle(() => ({
    width: shouldMaximizeOnOpen.value ? 40 : interpolate(-modalHeight.value, [0, maxHeight], [20, 40])
  }))

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(-modalHeight.value, [0, maxHeight - 100], [0, 1]),
    pointerEvents: position.value === 'closing' ? 'none' : 'auto'
  }))

  // Pan Gesture
  // ----------------------------
  const panGesture = Gesture.Pan()
    .onStart(() => {
      offsetY.value = modalHeight.value
    })
    .onChange((e) => {
      if (position.value !== 'closing') {
        modalHeight.value = offsetY.value + e.translationY
      }
    })
    .onEnd(() => {
      'worklet'

      const shouldMinimise = position.value === 'maximised' && -modalHeight.value < maxHeight - DRAG_BUFFER

      const shouldMaximise =
        canMaximize.value && position.value === 'minimised' && -modalHeight.value > minHeight.value + DRAG_BUFFER

      const shouldClose =
        ['minimised', 'closing'].includes(position.value) && -modalHeight.value < minHeight.value - DRAG_BUFFER

      if (shouldMaximise) {
        handleMaximize()
      } else if (shouldMinimise) {
        shouldMaximizeOnOpen.value ? handleClose() : handleMinimize()
      } else if (shouldClose) {
        handleClose()
      } else {
        modalHeight.value =
          position.value === 'maximised'
            ? withSpring(-maxHeight, springConfig)
            : withSpring(-minHeight.value, springConfig)
      }
    })

  // Effect to Handle Modal Closure
  // ----------------------------
  useEffect(() => {
    if (position.value !== 'closing' && isModalClosing) {
      handleClose()
    }
  }, [isModalClosing, position, handleClose])

  return {
    modalAnimatedStyle,
    handleAnimatedStyle,
    backdropAnimatedStyle,
    handleContentSizeChange,
    panGesture,
    handleClose,
    contentScrollHandlers,
    isContentScrollable
  }
}
