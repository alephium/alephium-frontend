import Ionicons from '@expo/vector-icons/Ionicons'
import styled from 'styled-components/native'

import { VERTICAL_GAP } from '~/style/globalStyle'

const TransactionSeparator = () => (
  <Separator>
    <ChainIcon name="chevron-down" size={18} />
  </Separator>
)

export default TransactionSeparator

const Separator = styled.View`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: center;
  padding: ${VERTICAL_GAP / 2}px 0;
`

const ChainIcon = styled(Ionicons)`
  margin-left: auto;
  margin-right: auto;
  color: ${({ theme }) => theme.font.tertiary};
`
