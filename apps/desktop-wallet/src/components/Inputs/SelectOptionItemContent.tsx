import { forwardRef, ReactNode } from 'react'
import styled, { css } from 'styled-components'

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
    <OptionContentWrapper className={className} contentDirection={contentDirection} isSelected={isSelected} ref={ref}>
      <OptionMainContent>{ContentTop}</OptionMainContent>
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

const OptionContentWrapper = styled.div<Pick<SelectOptionItemContentProps, 'contentDirection' | 'isSelected'>>`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: ${({ contentDirection }) => contentDirection};
  justify-content: space-between;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: var(--radius-big);
  background-color: ${({ theme, isSelected }) => (isSelected ? theme.bg.primary : theme.bg.tertiary)};
  overflow: hidden;

  ${({ theme, isSelected }) =>
    isSelected &&
    css`
      padding-left: 5px;

      &:after {
        content: '';
        position: absolute;
        left: 6px;
        top: 10%;
        bottom: 10%;
        width: 3px;
        background-color: ${theme.global.accent};
        border-radius: 10px;
      }
    `}

  &:hover {
    > div {
      background-color: ${({ theme }) => theme.bg.hover};
    }
  }
`
