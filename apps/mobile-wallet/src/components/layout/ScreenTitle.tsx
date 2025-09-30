import { ReactNode } from 'react'
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN, HEADER_OFFSET_TOP, VERTICAL_GAP } from '~/style/globalStyle'

export interface ScreenTitleProps {
  title: string
  scrollY?: SharedValue<number>
  sideDefaultMargin?: boolean
  SideComponent?: ReactNode
  paddingTop?: number | boolean
}

const ScreenTitle = ({ title, scrollY, sideDefaultMargin, SideComponent, paddingTop }: ScreenTitleProps) => {
  const insets = useSafeAreaInsets()
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY?.get() || 0, [0, 40], [1, 0], Extrapolate.CLAMP)
  }))

  return (
    <TitleContainer
      style={[
        titleAnimatedStyle,
        {
          marginHorizontal: sideDefaultMargin ? DEFAULT_MARGIN : 0,
          paddingTop: typeof paddingTop === 'boolean' ? insets.top + HEADER_OFFSET_TOP + VERTICAL_GAP : paddingTop
        }
      ]}
    >
      <Title>{title}</Title>
      {SideComponent}
    </TitleContainer>
  )
}

export default ScreenTitle

const TitleContainer = styled(Animated.View)`
  padding-bottom: 15px;
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 15px;
`

const Title = styled(AppText)`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.primary};
  align-self: flex-start;
  flex-shrink: 1;
`
