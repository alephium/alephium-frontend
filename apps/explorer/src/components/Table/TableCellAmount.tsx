import styled, { css } from 'styled-components'

export default styled.div<{ color?: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-grow: 1;
  min-width: 6em;
  flex-basis: 120px;
  gap: 6px;
  font-weight: 600;

  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `}
`
