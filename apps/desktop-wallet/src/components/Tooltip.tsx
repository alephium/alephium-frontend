import 'react-tooltip/dist/react-tooltip.css'

import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'

export type HasTooltip<T> = T & { tooltip?: string }

export default styled(Tooltip)`
  background-color: rgb(5, 5, 5) !important;
  color: #fff;
  z-index: 2;
`
