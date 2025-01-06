import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

const useScreenScrollHandler = () => {
  const screenScrollY = useSharedValue(0)

  const screenScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    screenScrollY.value = e.nativeEvent.contentOffset.y
  }

  return { screenScrollY, screenScrollHandler }
}

export default useScreenScrollHandler
