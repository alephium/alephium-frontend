import { StyleProp, ViewStyle } from 'react-native'
import { EntryAnimationsValues, withSpring, WithSpringConfig } from 'react-native-reanimated'

export const defaultSpringConfiguration: WithSpringConfig = {
  stiffness: 100,
  damping: 50
}

export const fastSpringConfiguration: WithSpringConfig = {
  stiffness: 260,
  damping: 30,
  overshootClamping: true
}

export const fastestSpringConfiguration: WithSpringConfig = {
  stiffness: 500,
  damping: 30,
  overshootClamping: true
}

export const PopInFast = (targetValues: EntryAnimationsValues) => {
  'worklet'
  const animations: StyleProp<ViewStyle> = {
    transform: [{ scale: withSpring(1, fastestSpringConfiguration) }]
  }
  const initialValues = {
    transform: [{ scale: 0 }]
  }

  return {
    initialValues,
    animations
  }
}

export const PopOutFast = (targetValues: EntryAnimationsValues) => {
  'worklet'
  const animations: StyleProp<ViewStyle> = {
    transform: [{ scale: withSpring(0, fastestSpringConfiguration) }]
  }
  const initialValues = {
    transform: [{ scale: 1 }]
  }
  return {
    initialValues,
    animations
  }
}
