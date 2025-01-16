import styled from 'styled-components'

import { ReactComponent as DotSvg } from '@/images/dot.svg'

interface DotIconProps {
  color: string
  size?: number
  strokeColor?: string
  className?: string
}

const defaultSize = 8

const DotIcon = ({ className }: DotIconProps) => <DotSvg className={className} />

export default styled(DotIcon)`
  fill: ${({ color }) => color};
  width: ${({ size }) => size ?? defaultSize}px;
  height: ${({ size }) => size ?? defaultSize}px;
  stroke: ${({ strokeColor }) => strokeColor};
  transition: all 0.3s ease-out;
`
