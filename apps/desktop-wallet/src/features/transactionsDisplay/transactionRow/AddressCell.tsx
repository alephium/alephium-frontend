import styled, { css } from 'styled-components'

const AddressCell = styled.div<{ alignRight?: boolean; hasMargins?: boolean }>`
  flex: 1;
  min-width: 0;
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
