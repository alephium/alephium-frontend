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

import { memo } from 'react'
import styled from 'styled-components'

import Button from '@/components/Button'
import SkeletonLoader from '@/components/SkeletonLoader'
import { ChartLength, chartLengths } from '@/features/historicChart/historicChartTypes'
import { chartLengthChanged } from '@/features/historicChart/historicWorthChartActions'
import useHistoricData from '@/features/historicChart/useHistoricData'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const ChartLengthBadges = memo(() => {
  const dispatch = useAppDispatch()
  const chartLength = useAppSelector((s) => s.historicWorthChart.chartLength)
  const { hasHistoricBalances, isLoading: isLoadingHistoricData } = useHistoricData()

  const handleChartLengthButtonClick = (length: ChartLength) => dispatch(chartLengthChanged(length))

  return (
    <ChartLengthBadgesStyled>
      {chartLengths.map((length) =>
        isLoadingHistoricData ? (
          <SkeletonLoader key={length} height="25px" width="30px" style={{ marginTop: 6, marginBottom: 12 }} />
        ) : (
          hasHistoricBalances && (
            <ButtonStyled
              key={length}
              transparent
              short
              isActive={length === chartLength}
              onClick={() => handleChartLengthButtonClick(length)}
            >
              {length}
            </ButtonStyled>
          )
        )
      )}
    </ChartLengthBadgesStyled>
  )
})

export default ChartLengthBadges

const ChartLengthBadgesStyled = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  color: ${({ theme }) => theme.font.primary};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.4)};
  border-color: ${({ theme }) => theme.font.primary};
  padding: 3px;
  height: auto;
  min-width: 32px;
  border-radius: var(--radius-small);

  &:hover {
    border-color: ${({ theme }) => theme.font.tertiary};
  }
`
