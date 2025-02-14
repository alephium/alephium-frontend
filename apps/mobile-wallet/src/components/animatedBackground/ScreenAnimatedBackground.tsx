import { useIsFocused } from '@react-navigation/native'

import AnimatedBackground from '~/components/animatedBackground/AnimatedBackground'
import { AnimatedBackgroundProps } from '~/components/animatedBackground/animatedBackgroundTypes'

const ScreenAnimatedBackground = (props: AnimatedBackgroundProps) => {
  const isFocused = useIsFocused()

  return <AnimatedBackground {...props} isAnimated={isFocused} usesGyroscope={isFocused} />
}

export default ScreenAnimatedBackground
