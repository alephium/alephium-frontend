import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { Dimensions, Pressable } from 'react-native'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import styled from 'styled-components/native'

interface BottomModalBackdropProps extends BottomSheetBackdropProps {
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const BottomModalBackdrop = ({ animatedPosition, animatedIndex, style, onPress }: BottomModalBackdropProps) => {
  const screenHeight = Dimensions.get('window').height

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedPosition.value, [screenHeight, 0], [0, 1], Extrapolation.CLAMP)
  }))

  return <Backdrop style={[style, containerAnimatedStyle]} onPress={onPress} />
}

export default BottomModalBackdrop

const Backdrop = styled(AnimatedPressable)`
  background-color: rgba(0, 0, 0, 0.8);
`
