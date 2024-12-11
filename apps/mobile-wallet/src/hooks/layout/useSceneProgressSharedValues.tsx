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

import { SceneProgress } from '@react-navigation/stack/lib/typescript/src/types'
import { useEffect } from 'react'
import { Animated } from 'react-native'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

const useSceneProgressSharedValues = (progress?: SceneProgress) => {
  const currentProgress = useSharedValue(0)
  const nextProgress = useSharedValue(0)

  const updateSharedValue = (sharedValue: SharedValue, animatedValue?: Animated.AnimatedInterpolation<number>) => {
    animatedValue?.addListener(({ value }) => {
      sharedValue.value = value
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
