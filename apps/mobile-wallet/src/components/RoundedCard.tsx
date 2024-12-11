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
import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface RoundedCardProps extends ViewProps {
  children: ReactNode
}

const RoundedCard = ({ children, ...props }: RoundedCardProps) => (
  <RoundedCardStyled {...props}>{children}</RoundedCardStyled>
)

export default RoundedCard

const RoundedCardStyled = styled.View`
  border-radius: 38px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: ${DEFAULT_MARGIN}px;
`
