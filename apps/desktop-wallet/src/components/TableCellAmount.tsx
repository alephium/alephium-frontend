import styled, { css } from 'styled-components'

export default styled.div<{ color?: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-grow: 1;
  gap: 6px;
  font-weight: var(--fontWeight-semiBold);

  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `}
`
