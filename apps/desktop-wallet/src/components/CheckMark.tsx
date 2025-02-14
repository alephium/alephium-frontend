import { Check } from 'lucide-react'
import styled from 'styled-components'

interface CheckMarkProps {
  className?: string
}

const CheckMark = ({ className }: CheckMarkProps) => (
  <div className={className}>
    <Check strokeWidth={4} />
  </div>
)

export default styled(CheckMark)`
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  color: ${({ theme }) => theme.global.accent};
`
