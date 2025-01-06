import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { SharedValue } from 'react-native-reanimated'

const useScrollToTopOnFocus = (scrollY?: SharedValue<number>) => {
  useFocusEffect(
    useCallback(() => {
      if (scrollY) scrollY.value = 0
    }, [scrollY])
  )
}

export default useScrollToTopOnFocus
