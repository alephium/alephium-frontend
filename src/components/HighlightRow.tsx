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
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import styled, { css } from 'styled-components/native'

import { BORDER_RADIUS, INPUTS_HEIGHT, INPUTS_PADDING } from '../style/globalStyle'

export interface RoundedRowProps {
  isTopRounded?: boolean
  isBottomRounded?: boolean
  hasBottomBorder?: boolean
}

interface HighlightRowProps extends RoundedRowProps {
  children: ReactNode | ReactNode[]
  isInput?: boolean
  title?: string
  subtitle?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

const HighlightRow = ({ title, subtitle, children, onPress, style }: HighlightRowProps) => {
  const Component = (
    <View style={style}>
      {title && (
        <View>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </View>
      )}
      {children}
    </View>
  )

  return onPress ? <TouchableWithoutFeedback onPress={onPress}>{Component}</TouchableWithoutFeedback> : Component
}

export default styled(HighlightRow)`
  ${({ isInput }) =>
    isInput
      ? css`
          justify-content: center;
          height: ${INPUTS_HEIGHT}px;
          padding: 0 ${INPUTS_PADDING}px;
          background-color: ${({ theme }) => theme.bg.highlight};
        `
      : css`
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          min-height: ${INPUTS_HEIGHT}px;
          padding: 20px 15px;
          background-color: ${({ theme }) => theme.bg.primary};
        `}

  ${({ isTopRounded }) =>
    isTopRounded &&
    css`
      border-top-left-radius: ${BORDER_RADIUS}px;
      border-top-right-radius: ${BORDER_RADIUS}px;
    `}

  ${({ isBottomRounded }) =>
    isBottomRounded &&
    css`
      border-bottom-left-radius: ${BORDER_RADIUS}px;
      border-bottom-right-radius: ${BORDER_RADIUS}px;
    `}

  ${({ hasBottomBorder }) =>
    hasBottomBorder &&
    css`
      border-bottom-width: 1px;
      border-bottom-color: ${({ theme }) => theme.bg.secondary};
    `}
`

const Title = styled.Text``

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.font.secondary};
`
