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
import styled, { css } from 'styled-components/native'

interface ButtonsRowProps {
  children: ReactNode[]
  style?: StyleProp<ViewStyle>
}

const ButtonsRow = ({ children, style }: ButtonsRowProps) => (
  <View style={style}>
    {children.map((button, index) => (
      <ButtonContainer key={index} isFirst={index === 0}>
        {button}
      </ButtonContainer>
    ))}
  </View>
)

export default styled(ButtonsRow)`
  flex-direction: row;
`

const ButtonContainer = styled.View<{ isFirst: boolean }>`
  flex: 1;
  margin-left: 10px;

  ${({ isFirst }) =>
    isFirst &&
    css`
      margin-left: 0;
    `}
`
