import styled from 'styled-components'

const NotificationBar: FC<{ className?: string }> = ({ className, children }) => (
  <div className={className}>{children}</div>
)

export default styled(NotificationBar)`
  width: 100%;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
`
