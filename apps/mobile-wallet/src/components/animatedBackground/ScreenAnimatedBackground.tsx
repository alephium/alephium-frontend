import { useIsFocused } from '@react-navigation/native'

import AnimatedBackground, { AnimatedBackgroundProps } from '~/components/animatedBackground/AnimatedBackground'

const ScreenAnimatedBackground = (props: AnimatedBackgroundProps) => {
  const isFocused = useIsFocused()

  return <AnimatedBackground {...props} isAnimated={isFocused} />
}

export default ScreenAnimatedBackground
