import { CSSProperties } from 'react'
import styled from 'styled-components'

interface SkeletonLoaderProps {
  height?: string
  width?: string
  style?: CSSProperties
  className?: string
}

const SkeletonLoader = ({ className, style }: SkeletonLoaderProps) => (
  <div className={className} style={style}>
    <AnimatedSkeletonLoaderBackground />
  </div>
)

export default styled(SkeletonLoader)`
  background-color: rgba(255, 255, 255, 0.05);
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '20px'};
  border-radius: 8px;
  overflow: hidden;
`

const AnimatedSkeletonLoaderBackground = styled.div`
  width: 100%;
  height: 100%;

  background-image: linear-gradient(-90deg, rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05));
  background-size: 400% 400%;
  animation: gradientAnimation 1.5s ease-in-out infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: -135% 0%;
    }
  }
`
