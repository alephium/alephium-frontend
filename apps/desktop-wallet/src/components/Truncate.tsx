import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Truncate = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props} />

export default styled(Truncate)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
