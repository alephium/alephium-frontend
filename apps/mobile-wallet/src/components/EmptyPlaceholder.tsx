import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

const EmptyPlaceholder = ({ children, ...props }: ViewProps) => (
  <EmptyPlaceholderStyled {...props}>
    <Content>{children}</Content>
  </EmptyPlaceholderStyled>
)

const EmptyPlaceholderStyled = styled.View`
  flex: 1;
  justify-content: center;
`

const Content = styled.View`
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.bg.primary};
`

export default EmptyPlaceholder
