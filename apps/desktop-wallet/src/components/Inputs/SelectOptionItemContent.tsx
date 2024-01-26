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
import styled, { css } from 'styled-components'

import CheckMark from '@/components/CheckMark'

interface SelectOptionItemContentProps {
  MainContent: ReactNode
  isSelected?: boolean
  SecondaryContent?: ReactNode
  contentDirection?: 'row' | 'column'
  className?: string
  displaysCheckMarkWhenSelected?: boolean
}

const SelectOptionItemContent = ({
  MainContent: ContentTop,
  SecondaryContent: ContentBottom,
  isSelected,
  contentDirection = 'row',
  className
}: SelectOptionItemContentProps) => (
  <OptionContentWrapper className={className} contentDirection={contentDirection}>
    <OptionMainContent>
      {ContentTop}
      {isSelected && (
        <CheckMarkContainer>
          <CheckMark />
        </CheckMarkContainer>
      )}
    </OptionMainContent>
    {ContentBottom && <OptionSecondaryContent>{ContentBottom}</OptionSecondaryContent>}
  </OptionContentWrapper>
)

export default SelectOptionItemContent

const OptionMainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.bg.primary};
  padding: var(--spacing-3);
  gap: var(--spacing-3);
`

const OptionSecondaryContent = styled.div`
  background-color: ${({ theme }) => theme.bg.background1};
  padding: var(--spacing-3);
`

const CheckMarkContainer = styled.div``

const OptionContentWrapper = styled.div<{ contentDirection: SelectOptionItemContentProps['contentDirection'] }>`
  flex: 1;
  display: flex;
  flex-direction: ${({ contentDirection }) => contentDirection};
  justify-content: space-between;
  min-width: 0;

  &:hover {
    > div {
      background-color: ${({ theme }) => theme.bg.hover};
    }
  }

  ${OptionSecondaryContent} {
    ${({ contentDirection }) =>
      contentDirection === 'row' &&
      css`
        background-color: ${({ theme }) => theme.bg.primary};
      `}
  }
`
