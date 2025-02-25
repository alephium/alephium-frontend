import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import Box from '~/components/layout/Box'
import { VERTICAL_GAP } from '~/style/globalStyle'

type EmptyPlaceholderProps = ViewProps & { noMargin?: boolean }

const EmptyPlaceholder = ({ children, ...props }: EmptyPlaceholderProps) => (
  <BoxStyled {...props}>
    <Content>{children}</Content>
  </BoxStyled>
)

export default EmptyPlaceholder

const BoxStyled = styled(Box)<EmptyPlaceholderProps>`
  justify-content: center;
  margin: ${({ noMargin }) => (noMargin ? 0 : `${VERTICAL_GAP / 2}px 0`)};
`

const Content = styled.View`
  align-items: center;
  gap: 10px;
`
