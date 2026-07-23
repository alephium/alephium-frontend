import { ReactNode } from 'react'
import styled from 'styled-components'

const NotificationBar = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <div className={className}>{children}</div>
)

export default styled(NotificationBar)`
  width: 100%;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
`
