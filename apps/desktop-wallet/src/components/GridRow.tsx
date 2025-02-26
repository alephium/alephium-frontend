import styled, { css } from 'styled-components'

const GridRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 1fr 1fr 1fr;

  ${({ onClick, theme }) =>
    onClick &&
    css`
      &:hover {
        cursor: pointer;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -8px;
          right: -8px;

          border-radius: var(--radius-big);
          background-color: ${theme.bg.hover};
        }
      }
    `}
`

export default GridRow
