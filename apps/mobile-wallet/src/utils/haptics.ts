import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { Platform } from 'react-native'

export const vibrate = (impactFeedbackStyle: ImpactFeedbackStyle) =>
  impactAsync(
    Platform.OS === 'ios'
      ? impactFeedbackStyle
      : impactFeedbackStyle === ImpactFeedbackStyle.Heavy
        ? ImpactFeedbackStyle.Medium
        : ImpactFeedbackStyle.Light
  )

export const ImpactStyle = ImpactFeedbackStyle
