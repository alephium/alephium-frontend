import { ReactNode } from 'react'
import styled from 'styled-components'

const Section = ({ children, className }: { className?: string; children?: ReactNode }) => (
  <Container className={className}>{children}</Container>
)

const Container = styled.section`
  width: 100%;
`

export default Section
