import { BottomSheetBackdropProps, TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import { Dimensions } from 'react-native'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import styled from 'styled-components/native'

interface BottomModalBackdropProps extends BottomSheetBackdropProps {
  onPress: () => void
}

const BottomModalBackdrop = ({ animatedPosition, animatedIndex, style, onPress }: BottomModalBackdropProps) => {
  const screenHeight = Dimensions.get('window').height

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedPosition.value, [screenHeight, 0], [0, 1], Extrapolation.CLAMP)
  }))

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Backdrop style={[style, containerAnimatedStyle]} />
    </TouchableWithoutFeedback>
  )
}

export default BottomModalBackdrop

const Backdrop = styled(Animated.View)`
  background-color: rgba(0, 0, 0, 0.8);
`
