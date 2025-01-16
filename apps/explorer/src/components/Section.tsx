import styled from 'styled-components'

const Section: FC<{ className?: string }> = ({ children, className }) => (
  <Container className={className}>{children}</Container>
)

const Container = styled.section`
  width: 100%;
`

export default Section
