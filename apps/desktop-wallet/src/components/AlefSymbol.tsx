import styled from 'styled-components'

import alefSymbol from '@/images/alef.svg'

interface AlefSymbolProps {
  color?: string
  className?: string
}

const AlefSymbol = ({ className, color }: AlefSymbolProps) => (
  <span className={className}>
    <HiddenForCopying>&nbsp;ALPH</HiddenForCopying>
    <AlefSymbolSVG color={color} />
  </span>
)

export default styled(AlefSymbol)`
  height: 1em;
`

const HiddenForCopying = styled.span`
  font-size: 0;
`

const AlefSymbolSVG = styled.span<{ color?: string }>`
  display: inline-block;
  font-size: 1em;
  width: 1em;
  height: 1em;
  -webkit-mask: url(${alefSymbol}) no-repeat 100% 100%;
  mask: url(${alefSymbol}) no-repeat 100% 100%;
  -webkit-mask-size: cover;
  mask-size: cover;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
