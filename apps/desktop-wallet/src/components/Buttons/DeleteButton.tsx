import { X } from 'lucide-react'
import styled from 'styled-components'

import Button, { ButtonProps } from '@/components/Button'

const DeleteButton = (props: ButtonProps) => <Button Icon={X} role="secondary" {...props} />

export default styled(DeleteButton)`
  position: absolute;
  top: -20px;
  right: -10px;
  opacity: 0;
  height: 30px;
  width: 30px;
  padding: 0;
  min-width: 30px;
  border-radius: var(--radius-full);
`
