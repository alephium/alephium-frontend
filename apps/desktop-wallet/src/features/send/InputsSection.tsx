import { ReactNode } from 'react'
import styled from 'styled-components'

interface InputsSectionProps {
  title: string
  subtitle?: string
  HeaderActions?: ReactNode
  className?: string
}

const InputsSection: FC<InputsSectionProps> = ({ title, className, HeaderActions, subtitle, children }) => (
  <InputsSectionStyled className={className}>
    <Header>
      <Title>{title}</Title>
      {HeaderActions}
    </Header>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
    {children}
  </InputsSectionStyled>
)

export default InputsSection

const InputsSectionStyled = styled.div`
  gap: 10px;
`

const Title = styled.div`
  font-size: 14px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
`

const Subtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  margin-left: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`
