/*
Copyright 2018 - 2022 The Alephium Authors
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
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS } from '~/style/globalStyle'

export interface ButtonProps extends PressableProps {
  title?: string
  type?: 'primary' | 'secondary' | 'transparent' | 'tint'
  variant?: 'default' | 'contrast' | 'accent' | 'valid' | 'alert' | 'highlight'
  style?: StyleProp<TextStyle & ViewStyle>
  wide?: boolean
  centered?: boolean
  iconProps?: ComponentProps<typeof Ionicons>
  color?: string
  round?: boolean
  flex?: boolean
  children?: ReactNode
  compact?: boolean
  animated?: boolean
}

const AnimatedAppText = Animated.createAnimatedComponent(AppText)
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons)

const Button = ({
  style,
  title,
  type = 'primary',
  variant = 'default',
  disabled,
  iconProps,
  children,
  round,
  color,
  centered,
  compact,
  flex,
  animated,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const hasOnlyIcon = !!iconProps && !title && !children

  const bg = {
    default: theme.button.primary,
    contrast: theme.font.primary,
    accent: type === 'primary' ? theme.button.primary : theme.button.secondary,
    valid: colord(theme.global.valid).alpha(0.1).toRgbString(),
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
      valid: theme.global.valid,
      alert: theme.global.alert,
      highlight: 'white'
    }[variant]

  const buttonContainerStyle: PressableProps['style'] = {
    width: round ? (compact ? 30 : 43) : props.wide ? '75%' : hasOnlyIcon ? 43 : 'auto',
    height: compact ? 30 : hasOnlyIcon ? 43 : 55,
    backgroundColor: {
      primary: bg,
      secondary: bg,
      transparent: 'transparent',
      tint: color ? colord(color).alpha(0.05).toHex() : ''
    }[type],
    borderRadius: round || compact ? 100 : BORDER_RADIUS,
    flex: flex ? 1 : 0
  }

  const buttonStyle: PressableProps['style'] = ({ pressed }) => [
    {
      opacity: pressed || disabled ? 0.5 : 1,
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
      height: animated ? '100%' : undefined,
      justifyContent: round ? 'center' : undefined,
      alignItems: round ? 'center' : undefined,
      gap: compact ? 5 : 10,
      minWidth: centered ? 200 : undefined,
      marginVertical: centered ? 0 : undefined,
      marginHorizontal: centered ? 'auto' : undefined,
      paddingVertical: round ? 0 : compact ? 5 : !hasOnlyIcon ? 0 : undefined,
      paddingHorizontal: round ? 0 : compact ? 10 : !hasOnlyIcon ? 25 : undefined
    },
    animated ? {} : buttonContainerStyle,
    style
  ]

  if (!iconProps && !title && !children)
    throw new Error('At least one of the following properties is required: icon, title, or children')

  const button = (
    <Pressable style={buttonStyle} disabled={disabled} {...props}>
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
      {iconProps && (
        <AnimatedIonicons
          layout={LinearTransition}
          color={font}
          size={compact ? 18 : hasOnlyIcon ? 22 : 20}
          {...iconProps}
        />
      )}
    </Pressable>
  )

  return animated ? (
    <Animated.View layout={LinearTransition} style={[buttonContainerStyle]}>
      {button}
    </Animated.View>
  ) : (
    button
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
      round
      type="primary"
      variant="accent"
      style={[style, !props.disabled ? { backgroundColor: theme.global.accent } : undefined]}
      color={!props.disabled ? 'white' : color}
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
