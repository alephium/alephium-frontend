import { ComponentProps } from 'react'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable)

type AnimatedPressableProps = Omit<ComponentProps<typeof AnimatedPressableBase>, 'key'> & {
  key?: string | number // Fix key type issues with pressable
}

const AnimatedPressable = ({ style, ...props }: AnimatedPressableProps) => {
  const fade = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.get()
  }))

  return (
    <AnimatedPressableBase
      onPressIn={() => {
        fade.set(withTiming(0.5, { duration: 150 }))
      }}
      onPressOut={() => {
        fade.set(withTiming(1, { duration: 150 }))
      }}
      style={[style, animatedStyle]}
      {...props}
    />
  )
}

export default AnimatedPressable
