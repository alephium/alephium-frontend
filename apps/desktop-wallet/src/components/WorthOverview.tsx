import styled from 'styled-components'

import Amount, { AmountLoaderProps } from '@/components/Amount'

interface WorthOverviewProps extends AmountLoaderProps {
  worth: number
  className?: string
}

const WorthOverview = ({ worth, ...props }: WorthOverviewProps) => (
  <WorthOverviewStyled value={worth} isFiat loaderHeight={32} tabIndex={0} semiBold {...props} />
)

export default WorthOverview

const WorthOverviewStyled = styled(Amount)`
  font-size: 40px;
`
