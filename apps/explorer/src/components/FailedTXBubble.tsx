import { ReactNode } from 'react'
import styled from 'styled-components'

interface FailedTXBubbleProps {
  tooltipContent: string
  children: ReactNode
}

const FailedTXBubble = ({ children, tooltipContent }: FailedTXBubbleProps) => (
  <FailedTXBubbleContainer data-tooltip-id="default" data-tooltip-content={tooltipContent}>
    {children}
  </FailedTXBubbleContainer>
)

export default FailedTXBubble

const FailedTXBubbleContainer = styled.div`
  position: absolute;
  height: 14px;
  width: 14px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.global.alert};
  color: white;
  top: auto;
  bottom: auto;
  right: -20px;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
`
