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
