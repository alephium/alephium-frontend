import styled from 'styled-components/native'

import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

export default styled.View`
  border-radius: ${BORDER_RADIUS_BIG}px;
  padding: ${DEFAULT_MARGIN}px;
  background-color: ${({ theme }) => theme.bg.tertiary};
`
