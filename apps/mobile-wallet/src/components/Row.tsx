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
        <Title medium truncate={truncate} ellipsizeMode="middle" color={titleColor} isVertical={isVertical}>
          {title}
        </Title>
        {subtitle && (
          <Subtitle ellipsizeMode="middle" truncate={truncate}>
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
    min-height: ${INPUTS_HEIGHT * 1.2}px;
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
    `}
`

const RightContent = styled.View<Pick<RowProps, 'isVertical' | 'noMaxWidth'>>`
  flex-direction: row;
  align-items: center;

  gap: 4px;
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
