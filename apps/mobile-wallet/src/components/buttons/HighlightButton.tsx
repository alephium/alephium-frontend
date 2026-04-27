import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'

interface HighlightButtonProps extends ButtonProps {
  title: string
  wide?: boolean
}

const HighlightButton = ({ title, wide, ...props }: HighlightButtonProps) => {
  const theme = useTheme()
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.set(withRepeat(withTiming(1.02, { duration: 500 }), -1, true))
  }, [scale])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }))

  return (
    <ButtonWrapper style={animatedStyle}>
      <Button
        title={title}
        style={{ backgroundColor: theme.global.accent }}
        color="white"
        variant="accent"
        type="primary"
        {...props}
      />
    </ButtonWrapper>
  )
}

export default HighlightButton

const ButtonWrapper = styled(Animated.View)`
  width: 100%;
  align-items: center;
`
