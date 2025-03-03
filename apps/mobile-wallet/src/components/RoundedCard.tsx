import { ReactNode } from 'react'
import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import { BORDER_RADIUS_HUGE, DEFAULT_MARGIN } from '~/style/globalStyle'

interface RoundedCardProps extends ViewProps {
  children: ReactNode
}

const RoundedCard = ({ children, ...props }: RoundedCardProps) => (
  <RoundedCardStyled {...props}>{children}</RoundedCardStyled>
)

export default RoundedCard

const RoundedCardStyled = styled.View`
  border-radius: ${BORDER_RADIUS_HUGE}px;
  overflow: hidden;
  padding: ${DEFAULT_MARGIN}px;
`
