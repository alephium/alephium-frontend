import styled, { css } from 'styled-components'

import InputArea from '@/components/Inputs/InputArea'

interface OptionProps {
  isSelected: boolean
  onSelect: () => void
  className?: string
}

const Option: FC<OptionProps> = ({ className, isSelected, onSelect, children }) => (
  <InputArea onMouseDown={onSelect} className={className}>
    <Circle filled={isSelected} />
    {children}
  </InputArea>
)

export default styled(Option)`
  display: flex;
  gap: 12px;
  align-items: center;

  padding: var(--spacing-3);
  background-color: ${({ theme }) => theme.bg.primary};
  color: inherit;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.secondary};
  }
`

const Circle = styled.div<{ filled: boolean }>`
  background-color: ${({ filled, theme }) => (filled ? theme.global.accent : theme.bg.secondary)};
  height: 15px;
  width: 15px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    ${({ filled }) =>
      filled &&
      css`
        content: '';
        display: block;
        height: 7px;
        width: 7px;
        background-color: var(--color-white);
        border-radius: var(--radius-full);
      `}
  }
`
