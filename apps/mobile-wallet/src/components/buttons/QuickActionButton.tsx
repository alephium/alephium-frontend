import styled from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'

interface QuickActionButtonProps extends ButtonProps {
  isLast?: boolean
}

export default styled(Button)<QuickActionButtonProps>`
  background-color: transparent;
  border-bottom-width: ${({ isLast }) => (!isLast ? '1px' : 0)};
  border-color: ${({ theme }) => theme.border.secondary};
  border-radius: 0;
`
