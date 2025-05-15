import { ReactNode } from 'react'
import styled from 'styled-components'

interface Props {
  primary: ReactNode
  secondary: ReactNode
}

const StatisticTextual = ({ primary, secondary }: Props) => (
  <Container>
    <Primary>{primary}</Primary>
    <Secondary>{secondary}</Secondary>
  </Container>
)

const Container = styled.div``

const Primary = styled.div`
  color: ${({ theme }) => theme.font.primary};
  font-size: 23px;
  font-weight: 700;
  margin-bottom: 5px;
`

const Secondary = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

export default StatisticTextual
