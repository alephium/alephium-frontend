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

import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import LinkToWeb from './LinkToWeb'

export type Instruction = {
  type: 'primary' | 'secondary' | 'link'
  text: string
  url?: string
}

interface CenteredInstructionsProps {
  instructions: Instruction[]
  style?: StyleProp<ViewStyle>
}

const CenteredInstructions = ({ instructions, style }: CenteredInstructionsProps) => (
  <View style={style}>
    {instructions.map(({ text, type, url }, i) =>
      type === 'link' ? (
        <LinkToWeb key={i} text={text} url={url || ''} />
      ) : (
        <Instruction key={i} type={type}>
          {text}
        </Instruction>
      )
    )}
  </View>
)

export default styled(CenteredInstructions)`
  justify-content: center;
  align-items: center;
  padding: 10%;
`

const Instruction = styled.Text<{ type: Instruction['type'] }>`
  color: ${({ type, theme }) =>
    type === 'primary' ? theme.font.primary : type === 'secondary' ? theme.font.secondary : theme.font.primary};

  font-weight: ${({ type }) => (type === 'primary' ? 'bold' : 'normal')};
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
  line-height: 23px;
`
