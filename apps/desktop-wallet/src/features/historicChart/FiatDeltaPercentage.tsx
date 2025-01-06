import styled from 'styled-components'

import DeltaPercentage from '@/components/DeltaPercentage'
import SkeletonLoader from '@/components/SkeletonLoader'
import useHistoricData from '@/features/historicChart/useHistoricData'

interface FiatDeltaPercentageProps {
  worthInBeginningOfChart?: number
  hoveredDataPointWorth: number
}

const FiatDeltaPercentage = ({ worthInBeginningOfChart, hoveredDataPointWorth }: FiatDeltaPercentageProps) => {
  const { isLoading: isLoadingHistoricData } = useHistoricData()

  if (isLoadingHistoricData) return <SkeletonLoader height="18px" width="70px" style={{ marginBottom: 6 }} />

  if (worthInBeginningOfChart === undefined) return null

  return (
    <FiatDeltaPercentageStyled>
      <DeltaPercentage initialValue={worthInBeginningOfChart} latestValue={hoveredDataPointWorth} />
    </FiatDeltaPercentageStyled>
  )
}

export default FiatDeltaPercentage

const FiatDeltaPercentageStyled = styled.div`
  font-size: 18px;
  margin-top: 5px;
`
