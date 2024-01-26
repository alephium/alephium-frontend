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
import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface ButtonsRowProps {
  children: ReactNode[]
  sticked?: boolean
  style?: StyleProp<ViewStyle>
  hasDivider?: boolean
  dividerColor?: string
}

const ButtonsRow = ({ children, hasDivider, dividerColor, style }: ButtonsRowProps) => {
  const buttons = children.filter((child) => !!child)

  return (
    <View style={style}>
      {buttons.map((c, i) => (
        <ButtonsContainer key={`ButtonsContainer-${i}`}>
          {c}
          {hasDivider && i !== buttons.length - 1 && (
            <Divider style={dividerColor ? { backgroundColor: dividerColor } : undefined} />
          )}
        </ButtonsContainer>
      ))}
    </View>
  )
}

export default styled(ButtonsRow)`
  flex-grow: 1;
  flex-direction: row;
  gap: ${({ sticked }) => (sticked ? 0 : 10)}px;
`

const ButtonsContainer = styled.View`
  flex: 1;
  flex-direction: row;
`

const Divider = styled.View`
  width: 1px;
  margin-right: -1px;
  height: 100%;
  background-color: ${({ theme }) => theme.border.secondary};
`
