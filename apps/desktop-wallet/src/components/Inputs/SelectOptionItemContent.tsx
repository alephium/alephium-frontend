import { forwardRef, ReactNode } from 'react'
import styled from 'styled-components'

import HorizontalDivider from '@/components/Dividers/HorizontalDivider'

interface SelectOptionItemContentProps {
  MainContent: ReactNode
  SecondaryContent?: ReactNode
  contentDirection?: 'row' | 'column'
  className?: string
  displaysCheckMarkWhenSelected?: boolean
  divider?: boolean
  dividerOffset?: number
}

const SelectOptionItemContent = forwardRef<HTMLDivElement, SelectOptionItemContentProps>(
  (
    {
      MainContent: ContentTop,
      SecondaryContent: ContentBottom,
      contentDirection = 'row',
      divider,
      dividerOffset,
      className
    }: SelectOptionItemContentProps,
    ref
  ) => (
    <OptionContentWrapper className={className} contentDirection={contentDirection} ref={ref}>
      <OptionMainContent>{ContentTop}</OptionMainContent>
      {ContentBottom && <OptionSecondaryContent>{ContentBottom}</OptionSecondaryContent>}
      {divider && <HorizontalDivider style={{ marginLeft: dividerOffset }} secondary />}
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
  padding: var(--spacing-2);
  gap: var(--spacing-3);
`

const OptionSecondaryContent = styled.div`
  padding: var(--spacing-2);

  &:empty {
    display: none;
  }
`

const OptionContentWrapper = styled.div<Pick<SelectOptionItemContentProps, 'contentDirection'>>`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: ${({ contentDirection }) => contentDirection};
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;

  &:hover {
    > div {
      background-color: ${({ theme }) => theme.bg.hover};
    }
  }
`
