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
        <LinkToWeb key={i} url={url || ''} style={{ marginVertical: 5 }}>
          {text}
        </LinkToWeb>
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
