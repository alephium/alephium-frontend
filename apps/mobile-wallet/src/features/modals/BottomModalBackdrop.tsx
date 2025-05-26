import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { Dimensions, Pressable } from 'react-native'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

interface BottomModalBackdropProps extends BottomSheetBackdropProps {
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const BottomModalBackdrop = ({ animatedPosition, style, onPress }: BottomModalBackdropProps) => {
  const screenHeight = Dimensions.get('window').height
  const { top, bottom } = useSafeAreaInsets()
  const insetsSum = top + bottom

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedPosition.value, [screenHeight - insetsSum, 0], [0, 1], Extrapolation.CLAMP)
  }))

  return <Backdrop style={[style, containerAnimatedStyle]} onPress={onPress} />
}

export default BottomModalBackdrop

const Backdrop = styled(AnimatedPressable)`
  background-color: rgba(0, 0, 0, 0.8);
`
