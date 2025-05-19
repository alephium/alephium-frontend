import { SceneProgress } from '@react-navigation/stack/lib/typescript/src/types'
import { useEffect } from 'react'
import { Animated } from 'react-native'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

const useSceneProgressSharedValues = (progress?: SceneProgress) => {
  const currentProgress = useSharedValue(0)
  const nextProgress = useSharedValue(0)

  const updateSharedValue = (
    sharedValue: SharedValue<number>,
    animatedValue?: Animated.AnimatedInterpolation<number>
  ) => {
    animatedValue?.addListener(({ value }) => {
      sharedValue.set(value)
    })
  }

  useEffect(() => {
    const animatedCurrentProgress = progress?.current
    const animatedNextProgress = progress?.next

    // Link the Animated interpolations to reanimated shared values
    updateSharedValue(currentProgress, animatedCurrentProgress)
    updateSharedValue(nextProgress, animatedNextProgress)

    // Clean up listeners on unmount
    return () => {
      animatedCurrentProgress?.removeAllListeners()
      animatedNextProgress?.removeAllListeners()
    }
  }, [currentProgress, nextProgress, progress])

  return { currentProgress, nextProgress }
}

export default useSceneProgressSharedValues
