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
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface RoundedCardProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

const RoundedCard = ({ children, style }: RoundedCardProps) => (
  <RoundedCardContainer style={style}>{children}</RoundedCardContainer>
)

export default RoundedCard

const RoundedCardContainer = styled.View`
  border-radius: 38px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.primary};
`
