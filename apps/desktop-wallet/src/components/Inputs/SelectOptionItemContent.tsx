import { forwardRef, ReactNode } from 'react'
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

const SelectOptionItemContent = forwardRef<HTMLDivElement, SelectOptionItemContentProps>(
  (
    {
      MainContent: ContentTop,
      SecondaryContent: ContentBottom,
      isSelected,
      contentDirection = 'row',
      className
    }: SelectOptionItemContentProps,
    ref
  ) => (
    <OptionContentWrapper className={className} contentDirection={contentDirection} ref={ref}>
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
)

export default SelectOptionItemContent

const OptionMainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--fontWeight-semiBold);
  padding: var(--spacing-3);
  gap: var(--spacing-3);
`

const OptionSecondaryContent = styled.div`
  padding: var(--spacing-3);

  &:empty {
    display: none;
  }
`

const CheckMarkContainer = styled.div``

const OptionContentWrapper = styled.div<{ contentDirection: SelectOptionItemContentProps['contentDirection'] }>`
  flex: 1;
  display: flex;
  flex-direction: ${({ contentDirection }) => contentDirection};
  justify-content: space-between;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-radius: var(--radius-big);
  overflow: hidden;

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
