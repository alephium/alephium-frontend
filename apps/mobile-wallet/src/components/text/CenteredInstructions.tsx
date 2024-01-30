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

import { memo } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { css } from 'styled-components/native'

import LinkToWeb from './LinkToWeb'

export type Instruction = {
  type: 'primary' | 'secondary' | 'error' | 'link'
  text: string
  url?: string
}

interface CenteredInstructionsProps {
  instructions: Instruction[]
  stretch?: boolean
  style?: StyleProp<ViewStyle>
  fontSize?: number
}

const CenteredInstructions = ({ instructions, style, fontSize = 17 }: CenteredInstructionsProps) => (
  <View style={style}>
    {instructions.map(({ text, type, url }, i) =>
      type === 'link' ? (
        <LinkToWeb key={i} text={text} url={url || ''} style={{ marginVertical: 5 }} />
      ) : (
        <Instruction key={i} type={type} style={{ fontSize }}>
          {text}
        </Instruction>
      )
    )}
  </View>
)

export default memo(styled(CenteredInstructions)`
  justify-content: center;
  align-items: center;
  ${({ stretch }) =>
    stretch
      ? css`
          flex: 1;
        `
      : css`
          padding-top: 15%;
        `}
  margin: 0 8%;
`)

const Instruction = styled.Text<{ type: Instruction['type'] }>`
  color: ${({ type, theme }) =>
    ({
      primary: theme.font.primary,
      secondary: theme.font.secondary,
      error: theme.global.alert,
      link: ''
    })[type]};

  font-weight: ${({ type }) => (['primary', 'error'].includes(type) ? 'bold' : 'normal')};
  margin-bottom: 10px;
  text-align: center;
  line-height: 23px;
`
