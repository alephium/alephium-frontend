import { ReactNode } from 'react'
import styled from 'styled-components'

interface InlineLabelValueInputProps {
  label: ReactNode
  InputComponent: ReactNode
  description?: string
  noHorizontalPadding?: boolean
  children?: ReactNode
  className?: string
}

const InlineLabelValueInput = ({
  label,
  InputComponent,
  description,
  noHorizontalPadding,
  children,
  className
}: InlineLabelValueInputProps) => (
  <KeyValueInputContainer className={className} noHorizontalPadding={noHorizontalPadding}>
    <KeyContainer>
      <Label>{label}</Label>
      {description && <DescriptionContainer>{description}</DescriptionContainer>}
      {children}
    </KeyContainer>
    <InputContainer>{InputComponent}</InputContainer>
  </KeyValueInputContainer>
)

export default InlineLabelValueInput

const KeyValueInputContainer = styled.div<Pick<InlineLabelValueInputProps, 'noHorizontalPadding'>>`
  display: flex;
  padding: var(--spacing-4) ${({ noHorizontalPadding }) => (noHorizontalPadding ? '0' : 'var(--spacing-3)')};
  gap: var(--spacing-8);
  width: 100%;
`

const KeyContainer = styled.div`
  flex: 2.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
`

const Label = styled.label`
  font-weight: var(--fontWeight-semiBold);
`

const DescriptionContainer = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`
