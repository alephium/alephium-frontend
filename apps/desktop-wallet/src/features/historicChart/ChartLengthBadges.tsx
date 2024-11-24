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
import styled, { css } from 'styled-components'

import Button from '@/components/Button'
import { ChartLength, chartLengths } from '@/features/historicChart/historicChartTypes'
import { chartLengthChanged } from '@/features/historicChart/historicWorthChartActions'
import useHistoricData from '@/features/historicChart/useHistoricData'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

interface ChartLengthBadgesProps {
  className?: string
}

const ChartLengthBadges = memo(({ className }: ChartLengthBadgesProps) => {
  const dispatch = useAppDispatch()
  const chartLength = useAppSelector((s) => s.historicWorthChart.chartLength)
  const { hasHistoricBalances, isLoading: isLoadingHistoricData } = useHistoricData()

  const handleChartLengthButtonClick = (length: ChartLength) => dispatch(chartLengthChanged(length))

  return (
    <ChartLengthBadgesStyled className={className}>
      {chartLengths.map((length) => {
        const isActive = length === chartLength

        return (
          !isLoadingHistoricData &&
          hasHistoricBalances && (
            <ButtonStyled
              key={length}
              role="secondary"
              onClick={() => handleChartLengthButtonClick(length)}
              short
              rounded
              borderless
              isActive={isActive}
            >
              {length}
            </ButtonStyled>
          )
        )
      })}
    </ChartLengthBadgesStyled>
  )
})

export default ChartLengthBadges

const ChartLengthBadgesStyled = styled.div`
  display: flex;
  gap: 5px;
`

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  padding: 3px;
  height: auto;
  min-width: 32px;
  ${({ isActive, theme }) => css`
    background-color: ${isActive ? theme.bg.contrast : 'transparent'};
    color: ${isActive ? theme.font.contrastPrimary : theme.font.tertiary};
    border: 1px solid ${isActive ? 'transparent' : theme.font.tertiary};
    opacity: ${isActive ? 1 : 0.5};
  `}
`
