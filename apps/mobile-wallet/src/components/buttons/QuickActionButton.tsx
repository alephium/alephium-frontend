import styled from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'

export default styled(Button)<ButtonProps>`
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.button.secondary};
`
