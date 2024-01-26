/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import Ionicons from '@expo/vector-icons/Ionicons'
import { colord } from 'colord'
import { ComponentProps, ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { fastestSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AppText from '~/components/AppText'
import { BORDER_RADIUS } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

export interface ButtonProps extends PressableProps {
  title?: string
  type?: 'primary' | 'secondary' | 'transparent' | 'tint'
  variant?: 'default' | 'contrast' | 'accent' | 'valid' | 'alert' | 'highlight' | 'highlightedIcon'
  style?: StyleProp<TextStyle & ViewStyle>
  wide?: boolean
  short?: boolean
  centered?: boolean
  iconProps?: ComponentProps<typeof Ionicons>
  customIcon?: ReactNode
  color?: string
  round?: boolean
  flex?: boolean
  children?: ReactNode
  compact?: boolean
  animated?: boolean
  haptics?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const AnimatedAppText = Animated.createAnimatedComponent(AppText)
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
  round,
  short,
  color,
  centered,
  compact,
  flex,
  animated,
  haptics,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const hasOnlyIcon = (!!iconProps || !!customIcon) && !title && !children
  const pressed = useSharedValue(false)

  const bg = {
    default: theme.button.primary,
    contrast: theme.font.primary,
    accent: type === 'primary' ? theme.button.primary : theme.button.secondary,
    valid: colord(theme.global.valid).alpha(0.1).toRgbString(),
    alert: colord(theme.global.alert).alpha(0.1).toRgbString(),
    transparent: 'transparent',
    highlight: theme.global.accent,
    highlightedIcon: theme.button.primary
  }[variant]

  const font =
    color ??
    {
      default: theme.font.primary,
      contrast: theme.font.contrast,
      accent: theme.global.accent,
      valid: theme.global.valid,
      alert: theme.global.alert,
      highlight: 'white',
      highlightedIcon: theme.font.primary
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
      height: short ? 45 : compact ? 30 : hasOnlyIcon ? 40 : 55,
      width: round ? (compact ? 30 : 40) : props.wide ? '75%' : hasOnlyIcon ? 40 : 'auto',
      justifyContent: round ? 'center' : undefined,
      alignItems: round ? 'center' : undefined,
      gap: compact ? 5 : 10,
      minWidth: centered ? 200 : undefined,
      marginVertical: centered ? 0 : undefined,
      marginHorizontal: centered ? 'auto' : undefined,
      paddingVertical: round ? 0 : compact ? 5 : !hasOnlyIcon ? 0 : undefined,
      paddingHorizontal: round ? 0 : compact ? 10 : !hasOnlyIcon ? 25 : undefined,
      borderRadius: round || compact ? 100 : BORDER_RADIUS,
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

  if (!iconProps && !customIcon && !title && !children)
    throw new Error('At least one of the following properties is required: icon, title, or children')

  return (
    <AnimatedPressable
      style={[buttonAnimatedStyle, buttonStyle]}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {title && (
        <AnimatedAppText
          style={{ flexGrow: 1, color: font, textAlign: 'center' }}
          medium
          size={compact ? 14 : 16}
          exiting={FadeOut}
          entering={FadeIn}
        >
          {title}
        </AnimatedAppText>
      )}
      {children}
      {iconProps ? (
        <IconContainer
          style={
            variant === 'highlightedIcon'
              ? {
                  backgroundColor: theme.global.accent,
                  borderRadius: 100,
                  padding: compact ? 0 : 6,
                  marginVertical: compact ? 0 : 6,
                  marginRight: compact ? -4 : 6,
                  height: compact ? 20 : undefined,
                  width: compact ? 20 : undefined,
                  overflow: 'hidden'
                }
              : undefined
          }
        >
          <AnimatedIonicons
            layout={LinearTransition}
            color={variant === 'highlightedIcon' ? 'white' : font}
            size={compact ? 16 : hasOnlyIcon ? 22 : 20}
            style={compact ? { marginLeft: 1, marginTop: 1 } : undefined}
            {...iconProps}
          />
        </IconContainer>
      ) : customIcon ? (
        customIcon
      ) : null}
    </AnimatedPressable>
  )
}

export const CloseButton = (props: ButtonProps) => (
  <Button onPress={props.onPress} iconProps={{ name: 'close-outline' }} round {...props} />
)

export const ContinueButton = ({ style, color, ...props }: ButtonProps) => {
  const theme = useTheme()

  return (
    <Button
      onPress={props.onPress}
      iconProps={{ name: 'arrow-forward-outline' }}
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
  <Button onPress={props.onPress} iconProps={{ name: 'arrow-back-outline' }} round {...props} />
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
