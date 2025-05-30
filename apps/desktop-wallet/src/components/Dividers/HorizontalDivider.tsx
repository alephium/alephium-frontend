import styled from 'styled-components'

const HorizontalDivider = styled.div<{ narrow?: boolean; secondary?: boolean }>`
  background-color: ${({ theme, secondary }) => (secondary ? theme.border.secondary : theme.border.primary)};
  height: 1px;
  width: 100%;
`

export default HorizontalDivider
