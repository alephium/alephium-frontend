import { ReactNode } from 'react'
import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface RoundedCardProps extends ViewProps {
  children: ReactNode
}

const RoundedCard = ({ children, ...props }: RoundedCardProps) => (
  <RoundedCardStyled {...props}>{children}</RoundedCardStyled>
)

export default RoundedCard

const RoundedCardStyled = styled.View`
  border-radius: 38px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: ${DEFAULT_MARGIN}px;
`
