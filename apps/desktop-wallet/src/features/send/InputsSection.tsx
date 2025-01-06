import { ReactNode } from 'react'
import styled from 'styled-components'

interface InputsSectionProps {
  title: string
  subtitle?: string
  HeaderActions?: ReactNode
  className?: string
}

const InputsSection: FC<InputsSectionProps> = ({ title, className, HeaderActions, subtitle, children }) => (
  <div className={className}>
    <Header>
      <Title>{title}</Title>
      {HeaderActions}
    </Header>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
    {children}
  </div>
)

export default InputsSection

const Title = styled.div`
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
`

const Header = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
`

const Subtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  margin-left: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`
