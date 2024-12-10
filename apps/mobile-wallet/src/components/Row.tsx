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

import { ReactNode } from 'react'
import { Pressable, StyleProp, ViewProps, ViewStyle } from 'react-native'
import Animated, { AnimatedProps, useSharedValue, withSpring } from 'react-native-reanimated'
import styled, { css } from 'styled-components/native'

import { fastestSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AppText, { AppTextProps } from '~/components/AppText'
import { INPUTS_HEIGHT, INPUTS_PADDING } from '~/style/globalStyle'

export interface RowProps {
  children?: ReactNode
  isSecondary?: boolean
  title?: string
  titleColor?: AppTextProps['color']
  subtitle?: string
  onPress?: () => void
  truncate?: boolean
  noMaxWidth?: boolean
  transparent?: boolean
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  layout?: AnimatedProps<ViewProps>['layout']
  isVertical?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const Row = ({
  title,
  subtitle,
  children,
  onPress,
  truncate,
  noMaxWidth,
  style,
  titleColor,
  layout,
  isVertical
}: RowProps) => {
  const rowOpacity = useSharedValue(1)

  const handleTouchStart = () => {
    rowOpacity.value = withSpring(0.8, fastestSpringConfiguration)
  }
  const handleTouchEnd = () => {
    rowOpacity.value = withSpring(1, fastestSpringConfiguration)
  }

  const componentContent = title ? (
    <>
      <LeftContent isVertical={isVertical}>
        <Title
          medium
          numberOfLines={truncate ? 1 : undefined}
          ellipsizeMode="middle"
          color={titleColor}
          isVertical={isVertical}
        >
          {title}
        </Title>
        {subtitle && (
          <Subtitle numberOfLines={truncate ? 1 : undefined} ellipsizeMode="middle">
            {subtitle}
          </Subtitle>
        )}
      </LeftContent>
      <RightContent noMaxWidth={noMaxWidth} isVertical={isVertical}>
        {children}
      </RightContent>
    </>
  ) : (
    children
  )

  return onPress ? (
    <AnimatedPressable
      onPress={onPress}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={[style, { opacity: rowOpacity }]}
    >
      {componentContent}
    </AnimatedPressable>
  ) : (
    <Animated.View style={style} layout={layout}>
      {componentContent}
    </Animated.View>
  )
}

export default styled(Row)`
  ${({ theme, isLast, isVertical }) => css`
    min-height: ${INPUTS_HEIGHT}px;
    padding: 16px 0;
    border-bottom-width: ${isLast ? 0 : 1}px;
    border-bottom-color: ${theme.border.secondary};

    ${!isVertical &&
    css`
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    `}
  `}
`

const Title = styled(AppText)<{ isVertical?: boolean }>`
  ${({ isVertical, color }) =>
    isVertical &&
    css`
      font-size: 13px;
      color: ${({ theme }) => color || theme.font.secondary};
    `}
`

const Subtitle = styled(AppText)`
  color: ${({ theme }) => theme.font.tertiary};
  padding-top: 5px;
`

const LeftContent = styled.View<Pick<RowProps, 'isVertical'>>`
  ${({ isVertical }) =>
    !isVertical &&
    css`
      flex: 1;
      align-self: flex-start;
    `}
`

const RightContent = styled.View<Pick<RowProps, 'isVertical' | 'noMaxWidth'>>`
  ${({ isVertical }) =>
    isVertical
      ? css`
          margin-top: 10px;
        `
      : css`
          padding-left: ${INPUTS_PADDING}px;
        `}

  ${({ noMaxWidth, isVertical }) =>
    !noMaxWidth &&
    !isVertical &&
    css`
      max-width: 60%;
    `};
`
