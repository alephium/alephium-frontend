/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import styled from 'styled-components'

import DeltaPercentage from '@/components/DeltaPercentage'
import SkeletonLoader from '@/components/SkeletonLoader'
import useHistoricData from '@/features/historicChart/useHistoricData'

interface FiatDeltaPercentageProps {
  hoveredDataPointWorth: number
  worthInBeginningOfChart?: number
  className?: string
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
