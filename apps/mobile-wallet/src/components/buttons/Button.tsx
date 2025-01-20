import Ionicons from '@expo/vector-icons/Feather'
import { colord } from 'colord'
import { ComponentProps, ReactNode } from 'react'
import { ActivityIndicator, Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastestSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AppText from '~/components/AppText'
import { ImpactStyle, vibrate } from '~/utils/haptics'

export interface ButtonProps extends PressableProps {
  title?: string
  type?: 'primary' | 'secondary' | 'transparent' | 'tint'
  variant?: 'default' | 'contrast' | 'accent' | 'valid' | 'alert' | 'highlight'
  style?: StyleProp<TextStyle & ViewStyle>
  wide?: boolean
  short?: boolean
  centered?: boolean
  iconProps?: ComponentProps<typeof Ionicons>
  customIcon?: ReactNode
  color?: string
  squared?: boolean
  flex?: boolean
  children?: ReactNode
  compact?: boolean
  animated?: boolean
  haptics?: boolean
  loading?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

const Button = ({
  style,
  title,
  type = 'primary',
  variant = 'default',
  disabled,
  iconProps,
  customIcon,
  children,
  squared,
  short,
  color,
  centered,
  compact,
  flex,
  animated,
  haptics,
  wide,
  loading = false,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const hasOnlyIcon = (!!iconProps || !!customIcon) && !title && !children
  const pressed = useSharedValue(false)

  const bg = {
    default: theme.button.primary,
    contrast: theme.bg.contrast,
    accent: type === 'primary' ? theme.button.primary : theme.button.secondary,
    valid: theme.global.valid,
    alert: colord(theme.global.alert).alpha(0.1).toRgbString(),
    transparent: 'transparent',
    highlight: theme.global.accent
  }[variant]

  const font =
    color ??
    {
      default: theme.font.primary,
      contrast: theme.font.contrast,
      accent: theme.global.accent,
      valid: theme.font.contrast,
      alert: theme.global.alert,
      highlight: 'white'
    }[variant]

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(pressed.value ? 0.7 : disabled ? 0.7 : 1, fastestSpringConfiguration)
  }))

  const buttonStyle: PressableProps['style'] = [
    {
      borderWidth: {
        primary: 0,
        secondary: 0,
        transparent: 0,
        tint: 0
      }[type],
      borderColor: {
        primary: 'transparent',
        secondary: bg,
        transparent: undefined,
        tint: undefined
      }[type],
      height: short ? 42 : compact ? 33 : hasOnlyIcon ? 40 : 54,
      width: compact && squared ? 33 : wide ? '100%' : hasOnlyIcon ? 40 : null,
      justifyContent: squared ? 'center' : undefined,
      alignItems: squared ? 'center' : undefined,
      gap: compact ? 5 : 10,
      minWidth: centered ? 200 : undefined,
      marginVertical: centered ? 0 : undefined,
      marginHorizontal: centered ? 'auto' : undefined,
      paddingVertical: squared ? 0 : !hasOnlyIcon ? 0 : undefined,
      paddingHorizontal: squared ? 0 : compact ? 10 : !hasOnlyIcon ? 25 : undefined,
      borderRadius: 100,
      backgroundColor: {
        primary: bg,
        secondary: bg,
        transparent: 'transparent',
        tint: color ? colord(color).alpha(0.1).toHex() : ''
      }[type],
      flex: flex ? 1 : 0
    },
    style
  ]

  const handlePressIn = () => {
    if (haptics || ['highlight', 'highlightedIcon'].includes(variant)) {
      vibrate(ImpactStyle.Light)
    }
    pressed.value = true
  }

  const handlePressOut = () => {
    pressed.value = false
  }

  if (!iconProps && !customIcon && !title && !children) {
    throw new Error('At least one of the following properties is required: icon, title, or children')
  }

  return (
    <AnimatedPressable
      style={[buttonAnimatedStyle, buttonStyle]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={compact ? 12 : 8}
      {...props}
    >
      {loading ? (
        <IconContainer>
          <ActivityIndicator color={font} size="small" />
        </IconContainer>
      ) : (
        <>
          {iconProps ? (
            <IconContainer>
              <AnimatedIonicons
                layout={LinearTransition}
                color={font}
                size={compact || short ? 16 : hasOnlyIcon ? 22 : 18}
                {...iconProps}
              />
            </IconContainer>
          ) : customIcon ? (
            customIcon
          ) : null}
          {title && (
            <ButtonText color={font} medium size={compact || short ? 14 : 16}>
              {title}
            </ButtonText>
          )}
          {children}
        </>
      )}
    </AnimatedPressable>
  )
}

export const CloseButton = (props: ButtonProps) => (
  <Button onPress={props.onPress} iconProps={{ name: 'x' }} compact squared {...props} />
)

export const ContinueButton = ({ style, color, ...props }: ButtonProps) => {
  const theme = useTheme()

  return (
    <Button
      onPress={props.onPress}
      iconProps={{ name: 'arrow-right' }}
      type="primary"
      style={[
        style,
        { height: 32, flexDirection: 'row', alignItems: 'center', gap: 10 },
        !!props.title && { minWidth: 75 },
        !props.disabled
          ? {
              backgroundColor: theme.global.accent
            }
          : undefined
      ]}
      color={!props.disabled ? 'white' : color}
      title={props.title || !props.disabled ? 'Next' : undefined}
      compact
      animated
      haptics
      {...props}
    />
  )
}

export const BackButton = (props: ButtonProps) => (
  <Button onPress={props.onPress} iconProps={{ name: 'arrow-left' }} squared compact {...props} />
)

export default styled(Button)`
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-direction: row;
`

const IconContainer = styled.View`
  align-items: center;
  justify-content: center;
`

const ButtonText = styled(AppText)`
  text-align: center;
  flex-shrink: 1;
`
