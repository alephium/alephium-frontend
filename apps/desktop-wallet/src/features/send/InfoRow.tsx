import { ReactNode } from 'react'
import styled from 'styled-components'

interface InfoRowProps {
  label: string
  className?: string
  children?: ReactNode
}

const InfoRow = ({ label, className, children }: InfoRowProps) => (
  <div className={className}>
    <Label>{label}</Label>
    <div>{children}</div>
  </div>
)

export default styled(InfoRow)`
  display: flex;
  justify-content: space-between;
  padding: 18px 0;
`

const Label = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`
