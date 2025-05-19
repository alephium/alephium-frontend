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
  restSpeedThreshold: 1,
  restDisplacementThreshold: 1
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
  const maxHeight = dimensions.height - (Platform.OS === 'ios' ? insets.top : insets.top * 1.5)

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
    navHeight.set(withSpring(0, springConfig))
    modalHeight.set(withSpring(0, springConfig, (finished) => finished && runOnJS(handleCloseOnJS)()))
    position.set('closing')
  }, [handleCloseOnJS, modalHeight, navHeight, position])

  const handleMaximize = useCallback(() => {
    'worklet'
    navHeight.set(withSpring(customNavHeight, springConfig))
    modalHeight.set(withSpring(-maxHeight, springConfig, (finished) => finished && runOnJS(setStateToIdle)()))
    position.set('maximised')
  }, [navHeight, customNavHeight, modalHeight, maxHeight, position, setStateToIdle])

  const handleMinimize = useCallback(() => {
    'worklet'
    navHeight.set(withSpring(0, springConfig))
    modalHeight.set(withSpring(-minHeight.get(), springConfig, (finished) => finished && runOnJS(setStateToIdle)()))
    position.set('minimised')
  }, [navHeight, modalHeight, minHeight, position, setStateToIdle])

  const handleContentSizeChange = useCallback(
    (_w: number, newContentHeight: number) => {
      if (!modalHeight.get() || newContentHeight > contentHeight.get() + 1) {
        runOnUI(() => {
          contentHeight.set(newContentHeight)
          canMaximize.set(contentHeight.get() > maxHeight)
          const contentIsScrollable = contentHeight.get() > dimensions.height * 0.8
          shouldMaximizeOnOpen.set(maximisedContent || contentIsScrollable)
          // Determine if scrolling is needed
          runOnJS(setIsContentScrollable)(contentIsScrollable)
          minHeight.set(
            customMinHeight
              ? customMinHeight
              : shouldMaximizeOnOpen.get()
                ? maxHeight
                : contentHeight.get() + customNavHeight + (Platform.OS === 'ios' ? insets.bottom : insets.bottom + 18)
          )
          shouldMaximizeOnOpen.get() ? handleMaximize() : handleMinimize()
        })()
      }
    },
    [
      canMaximize,
      contentHeight,
      customMinHeight,
      customNavHeight,
      dimensions.height,
      handleMaximize,
      handleMinimize,
      insets.bottom,
      maxHeight,
      maximisedContent,
      minHeight,
      modalHeight,
      shouldMaximizeOnOpen
    ]
  )

  // Animated Styles
  // ----------------------------
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    height: -modalHeight.get()
  }))

  const handleAnimatedStyle = useAnimatedStyle(() => ({
    width: shouldMaximizeOnOpen.get() ? 40 : interpolate(-modalHeight.get(), [0, maxHeight], [20, 40])
  }))

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(-modalHeight.get(), [0, maxHeight - 100], [0, 1]),
    pointerEvents: position.get() === 'closing' ? 'none' : 'auto'
  }))

  // Pan Gesture
  // ----------------------------
  const panGesture = Gesture.Pan()
    .onStart(() => {
      offsetY.set(modalHeight.get())
    })
    .onChange((e) => {
      if (position.get() !== 'closing') {
        modalHeight.set(offsetY.get() + e.translationY)
      }
    })
    .onEnd(() => {
      'worklet'
      const shouldMinimise = position.get() === 'maximised' && -modalHeight.get() < maxHeight - DRAG_BUFFER
      const shouldMaximise =
        canMaximize.get() && position.get() === 'minimised' && -modalHeight.get() > minHeight.get() + DRAG_BUFFER
      const shouldClose =
        ['minimised', 'closing'].includes(position.get()) && -modalHeight.get() < minHeight.get() - DRAG_BUFFER
      if (shouldMaximise) {
        handleMaximize()
      } else if (shouldMinimise) {
        shouldMaximizeOnOpen.get() ? handleClose() : handleMinimize()
      } else if (shouldClose) {
        handleClose()
      } else {
        modalHeight.set(
          position.get() === 'maximised'
            ? withSpring(-maxHeight, springConfig)
            : withSpring(-minHeight.get(), springConfig)
        )
      }
    })

  useEffect(() => {
    if (position.get() !== 'closing' && isModalClosing) {
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
