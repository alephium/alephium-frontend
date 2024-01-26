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
import { View, ViewProps } from 'react-native'
import styled from 'styled-components/native'

interface ButtonStackProps extends ViewProps {
  children: ReactNode[]
}

const ButtonStack = ({ children, style }: ButtonStackProps) => (
  <View style={style}>{children?.map((child, i) => <ButtonContainer key={i}>{child}</ButtonContainer>)}</View>
)

export default styled(ButtonStack)`
  width: 75%;
`

const ButtonContainer = styled.View`
  padding: 10px;
`
