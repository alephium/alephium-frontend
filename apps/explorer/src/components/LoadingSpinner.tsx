import { CSSProperties } from 'react'
import { RiLoader4Line } from 'react-icons/ri'
import styled from 'styled-components'

interface LoadingSpinnerProps {
  size?: number
  style?: CSSProperties
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size, style }) => (
  <SpinnerContainer>
    <Spinner style={style} size={size} />
  </SpinnerContainer>
)

export default LoadingSpinner

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Spinner = styled(RiLoader4Line)`
  animation: spin 1s infinite;
  color: ${({ theme }) => theme.font.secondary};
`
