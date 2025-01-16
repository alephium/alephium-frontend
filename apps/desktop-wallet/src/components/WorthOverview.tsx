import styled from 'styled-components'

import Amount, { AmountLoaderProps } from '@/components/Amount'

interface WorthOverviewProps extends AmountLoaderProps {
  worth: number
  overrideWorth?: number
  className?: string
}

const WorthOverview = ({ overrideWorth, worth, ...props }: WorthOverviewProps) => (
  <WorthOverviewStyled value={overrideWorth ?? worth} isFiat loaderHeight={32} tabIndex={0} semiBold {...props} />
)

export default WorthOverview

const WorthOverviewStyled = styled(Amount)`
  font-size: 36px;
  font-weight: var(--fontWeight-bold);
`
