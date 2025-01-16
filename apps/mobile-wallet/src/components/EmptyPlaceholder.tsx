import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import { VERTICAL_GAP } from '~/style/globalStyle'

const EmptyPlaceholder = ({ children, ...props }: ViewProps) => (
  <EmptyPlaceholderStyled {...props}>
    <Content>{children}</Content>
  </EmptyPlaceholderStyled>
)

const EmptyPlaceholderStyled = styled.View`
  flex: 1;
  justify-content: center;
  margin: ${VERTICAL_GAP / 2}px 0;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
`

const Content = styled.View`
  align-items: center;
  gap: 10px;
  padding: 20px;
`

export default EmptyPlaceholder
