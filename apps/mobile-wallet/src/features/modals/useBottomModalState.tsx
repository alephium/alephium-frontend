import { useCallback, useEffect, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { interpolate, runOnJS, runOnUI, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { removeModal } from '~/features/modals/modalActions'
import { selectModalById } from '~/features/modals/modalSelectors'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

type BottomModalPositions = 'minimised' | 'maximised' | 'closing'

export type BottomModalAnimationStates = 'idle' | 'animating'

export interface UseBottomModalStateParams {
  modalId: number
  navHeight: number
  maximisedContent?: boolean
  minHeight?: number
  onClose?: () => void
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
  const maxHeight = dimensions.height - (Platform.OS === 'ios' ? insets.top : insets.top * 2)

  // Initialize shared values
  // ----------------------------
  const modalHeight = useSharedValue(0)
  const position = useSharedValue<BottomModalPositions>('minimised')
  const navHeight = useSharedValue(0)
  const minHeight = useSharedValue(customMinHeight || 0)
  const shouldMaximizeOnOpen = useSharedValue(!!maximisedContent)
  const contentHeight = useSharedValue(0)
  const canMaximize = useSharedValue(false)
  const offsetY = useSharedValue(0)
  const [isContentScrollable, setIsContentScrollable] = useState(false)
  const isModalClosing = useAppSelector((s) => selectModalById(s, modalId)?.isClosing)
  const [modalAnimationState, setModalAnimationState] = useState<BottomModalAnimationStates>('animating')

  // Handlers
  // ----------------------------
  const handleCloseOnJS = useCallback(() => {
    if (onClose) onClose()
    dispatch(removeModal({ id: modalId }))
  }, [dispatch, modalId, onClose])

  const setStateToIdle = useCallback(() => {
    setModalAnimationState('idle')
  }, [])

  const handleClose = useCallback(() => {
    'worklet'
    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(0, springConfig, (finished) => {
      if (finished) {
        runOnJS(handleCloseOnJS)()
      }
    })
    position.value = 'closing'
  }, [handleCloseOnJS, modalHeight, navHeight, position])

  const handleMaximize = useCallback(() => {
    'worklet'
    navHeight.value = withSpring(customNavHeight, springConfig)
    modalHeight.value = withSpring(-maxHeight, springConfig, (finished) => {
      if (finished) {
        runOnJS(setStateToIdle)()
      }
    })
    position.value = 'maximised'
  }, [navHeight, customNavHeight, modalHeight, maxHeight, position, setStateToIdle])

  const handleMinimize = useCallback(() => {
    'worklet'
    navHeight.value = withSpring(0, springConfig)
    modalHeight.value = withSpring(-minHeight.value, springConfig, (finished) => {
      if (finished) {
        runOnJS(setStateToIdle)()
      }
    })
    position.value = 'minimised'
  }, [navHeight, modalHeight, minHeight, position, setStateToIdle])

  const handleContentSizeChange = useCallback(
    (_w: number, newContentHeight: number) => {
      if (!modalHeight.value || newContentHeight > contentHeight.value + 1) {
        runOnUI(() => {
          contentHeight.value = newContentHeight
          canMaximize.value = contentHeight.value > maxHeight
          const contentIsScrollable = contentHeight.value > dimensions.height * 0.8
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
    isContentScrollable,
    modalAnimationState
  }
}
