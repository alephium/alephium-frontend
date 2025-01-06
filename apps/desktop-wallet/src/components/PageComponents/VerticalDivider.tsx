import styled from 'styled-components'

export default styled.div`
  width: 1px;
  min-height: var(--spacing-4);
  height: 100%;
  background-color: ${({ theme }) => theme.border.primary};
`
