import styled, { css } from 'styled-components'

const AddressCell = styled.div<{ alignRight?: boolean; hasMargins?: boolean }>`
  min-width: 0;
  max-width: 120px;
  flex-grow: 1;
  align-items: baseline;
  display: flex;

  ${({ hasMargins }) =>
    hasMargins &&
    css`
      margin: 0 var(--spacing-4);
    `}

  ${({ alignRight }) =>
    alignRight &&
    css`
      justify-content: flex-end;
    `}
`

export default AddressCell
