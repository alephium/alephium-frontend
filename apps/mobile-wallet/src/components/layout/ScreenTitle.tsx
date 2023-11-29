/*
Copyright 2018 - 2023 The Alephium Authors
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
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import styled from 'styled-components'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface ScreenTitleProps {
  title: string
  RightContent?: ReactNode
  scrollY?: SharedValue<number>
}

const ScreenTitle = ({ title, RightContent, scrollY }: ScreenTitleProps) => {
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY?.value || 0, [0, 40], [1, 0], Extrapolate.CLAMP)
  }))

  return (
    <TitleContainer style={titleAnimatedStyle}>
      <Title>{title}</Title>
      {RightContent}
    </TitleContainer>
  )
}

export default ScreenTitle

const TitleContainer = styled(Animated.View)`
  padding: 10px ${DEFAULT_MARGIN}px;
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
