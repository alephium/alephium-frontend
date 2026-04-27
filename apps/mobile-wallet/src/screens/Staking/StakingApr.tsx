import { useMemo } from 'react'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { useFetchStakingStats } from '~/features/staking/hooks/useFetchStakingStats'
import { useAppSelector } from '~/hooks/redux'
import AmountSkeleton from '~/screens/Staking/AmountSkeleton'

const StakingApr = () => {
  const { data, isLoading } = useFetchStakingStats()
  const region = useAppSelector((s) => s.settings.region)

  const percentFormatter = useMemo(
    () => new Intl.NumberFormat(region, { style: 'percent', maximumFractionDigits: 2 }),
    [region]
  )

  if (isLoading) return <AmountSkeleton height={25} />

  return <StakingAprStyled>{data?.apr ? percentFormatter.format(Number(data.apr) / 100) : '-'}</StakingAprStyled>
}

export default StakingApr

const StakingAprStyled = styled(AppText)`
  font-size: 20px;
  font-weight: 600;
  color: white;
`
