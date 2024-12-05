/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ReactNode } from 'react'
import styled from 'styled-components'

interface InlineLabelValueInputProps {
  label: ReactNode
  InputComponent: ReactNode
  description?: string
  noHorizontalPadding?: boolean
  noTopPadding?: boolean
  noBottomPadding?: boolean
  children?: ReactNode
  className?: string
}

const InlineLabelValueInput = ({
  label,
  InputComponent,
  description,
  noHorizontalPadding,
  noTopPadding,
  noBottomPadding,
  children,
  className
}: InlineLabelValueInputProps) => (
  <KeyValueInputContainer
    className={className}
    noHorizontalPadding={noHorizontalPadding}
    noTopPadding={noTopPadding}
    noBottomPadding={noBottomPadding}
  >
    <KeyContainer>
      <Label>{label}</Label>
      {description && <DescriptionContainer>{description}</DescriptionContainer>}
      {children}
    </KeyContainer>
    <InputContainer>{InputComponent}</InputContainer>
  </KeyValueInputContainer>
)

export default InlineLabelValueInput

const KeyValueInputContainer = styled.div<
  Pick<InlineLabelValueInputProps, 'noHorizontalPadding' | 'noTopPadding' | 'noBottomPadding'>
>`
  display: flex;
  padding: var(--spacing-4) ${({ noHorizontalPadding }) => (noHorizontalPadding ? '0' : 'var(--spacing-3)')};
  padding-top: ${({ noTopPadding }) => (noTopPadding ? '0' : 'var(--spacing-4)')};
  padding-bottom: ${({ noBottomPadding }) => (noBottomPadding ? '0' : 'var(--spacing-4)')};
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
