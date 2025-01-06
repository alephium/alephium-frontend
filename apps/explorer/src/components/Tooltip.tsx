import 'react-tooltip/dist/react-tooltip.css'

import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'

export default styled(Tooltip)`
  background-color: ${({ theme }) => (theme.name === 'dark' ? theme.bg.background2 : theme.font.primary)};
  opacity: 1 !important;
`
