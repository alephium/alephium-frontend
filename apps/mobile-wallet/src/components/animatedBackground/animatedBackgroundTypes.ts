import { SharedValue } from 'react-native-reanimated'

export interface AnimatedBackgroundProps {
  height?: number
  width?: number
  scrollY?: SharedValue<number>
  isAnimated?: boolean
  usesGyroscope?: boolean
  isFullScreen?: boolean
  showAlephiumLogo?: boolean
  shade?: string
}
