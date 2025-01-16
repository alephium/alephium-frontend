import { colord } from 'colord'
import styled from 'styled-components'

import Button, { ButtonProps } from '@/components/Button'

const FooterButton: FC<ButtonProps> = ({ children, ...props }) => (
  <ModalFooter>
    <Button tall {...props}>
      {children}
    </Button>
  </ModalFooter>
)

export default FooterButton

const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => colord(theme.bg.background1).alpha(0.5).toHex()};
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-6);
  margin: var(--spacing-4) calc(-1 * var(--spacing-4)) 0;
`
