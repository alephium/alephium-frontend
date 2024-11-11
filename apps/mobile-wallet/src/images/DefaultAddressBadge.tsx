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

import { Star } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface DefaultAddressBadgeProps {
  color?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

const DefaultAddressBadge = ({ size = 24, ...props }: DefaultAddressBadgeProps) => (
  <DefaultAddressBadgeStyled size={size} {...props}>
    <StarStyled size={size - 2} color="white" style={{ fill: 'white' }} />
  </DefaultAddressBadgeStyled>
)

export default DefaultAddressBadge

const DefaultAddressBadgeStyled = styled.View<DefaultAddressBadgeProps>`
  justify-content: center;
  align-items: center;
  border-radius: ${({ size }) => size}px;
  background-color: ${({ color }) => color};
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`

const StarStyled = styled(Star)``
