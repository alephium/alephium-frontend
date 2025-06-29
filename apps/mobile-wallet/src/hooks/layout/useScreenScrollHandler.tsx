import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

const useScreenScrollHandler = () => {
  const screenScrollY = useSharedValue(0)
  const latestScreenScrollY = useRef(0)

  useFocusEffect(
    useCallback(() => {
      screenScrollY.set(latestScreenScrollY.current)
    }, [screenScrollY])
  )

  const screenScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    latestScreenScrollY.current = e.nativeEvent.contentOffset.y
    screenScrollY.set(latestScreenScrollY.current)
  }

  return { screenScrollY, screenScrollHandler }
}

export default useScreenScrollHandler
