import styled from 'styled-components'

export default styled.div`
  width: 1px;
  min-height: var(--spacing-3);
  height: 70%;
  background-color: ${({ theme }) => theme.border.primary};
`
