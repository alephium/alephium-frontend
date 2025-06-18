import { ReactNode } from 'react'
import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

interface RoundedCardProps extends ViewProps {
  children: ReactNode
}

const RoundedCard = ({ children, ...props }: RoundedCardProps) => (
  <RoundedCardStyled {...props}>{children}</RoundedCardStyled>
)

export default RoundedCard

const RoundedCardStyled = styled.View`
  border-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
  padding: ${DEFAULT_MARGIN}px;
  height: 170px;
`
