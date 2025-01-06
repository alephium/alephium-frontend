import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { DApp } from '~/features/ecosystem/ecosystemTypes'

const DAppCard = ({ name }: DApp) => (
  <CardContainer>
    <AppText>{name}</AppText>
  </CardContainer>
)

export default DAppCard

const CardContainer = styled.View`
  align-items: center;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 9px;
`
