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

import { AddressHash, CHART_DATE_FORMAT, toHumanReadableAmount } from '@alephium/shared'
import dayjs, { Dayjs } from 'dayjs'
import { memo, useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import styled, { useTheme } from 'styled-components'

import useFetchWalletWorthAlph from '@/api/apiDataHooks/wallet/useFetchWalletWorthAlph'
import { ChartLength, DataPoint, LatestAmountPerAddress } from '@/features/historicChart/historicChartTypes'
import { getChartOptions, getFilteredChartData } from '@/features/historicChart/historicChartUtils'
import useHistoricData from '@/features/historicChart/useHistoricData'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'

interface HistoricWorthChartProps {
  onDataPointHover: (dataPoint?: DataPoint) => void
  onWorthInBeginningOfChartChange: (worthInBeginningOfChart?: DataPoint['worth']) => void
  addressHash?: AddressHash
}

export const historicWorthChartHeight = 100

const now = dayjs()
const startingDates: Record<ChartLength, Dayjs> = {
  '1d': now.subtract(1, 'day'),
  '1w': now.subtract(1, 'week'),
  '1m': now.subtract(1, 'month'),
  '1y': now.subtract(1, 'year')
}

const HistoricWorthChart = memo(function HistoricWorthChart({
  addressHash,
  onDataPointHover,
  onWorthInBeginningOfChartChange
}: HistoricWorthChartProps) {
  const theme = useTheme()
  const length = useAppSelector((s) => s.historicWorthChart.chartLength)
  const allAddressesHashes = useAppSelector(selectAllAddressHashes)
  const { alphBalanceHistoryPerAddress, alphPriceHistory, isLoading: isLoadingHistoricData } = useHistoricData()
  const { data: latestWorth } = useFetchWalletWorthAlph()

  const [chartData, setChartData] = useState<DataPoint[]>([])

  const startingDate = startingDates[length].format(CHART_DATE_FORMAT)
  const isDataAvailable = !isLoadingHistoricData && !!alphPriceHistory
  const firstItem = chartData.at(0)

  useEffect(() => {
    onWorthInBeginningOfChartChange(firstItem?.worth)
  }, [firstItem?.worth, onWorthInBeginningOfChartChange])

  useEffect(() => {
    if (!isDataAvailable) {
      setChartData([])
      return
    }

    const computeChartDataPoints = (): DataPoint[] => {
      const addressesLatestAmount: LatestAmountPerAddress = {}

      const dataPoints = alphPriceHistory.map(({ date, value }) => {
        let totalAmountPerDate = BigInt(0)
        const addresses = addressHash ? [addressHash] : allAddressesHashes

        addresses.forEach((hash) => {
          const addressAlphBalanceHistory = alphBalanceHistoryPerAddress[hash]
          const amountOnDate = addressAlphBalanceHistory?.[date]

          if (amountOnDate !== undefined) {
            const amount = BigInt(amountOnDate)
            totalAmountPerDate += amount
            addressesLatestAmount[hash] = amount
          } else {
            totalAmountPerDate += addressesLatestAmount[hash] ?? BigInt(0)
          }
        })

        return {
          date,
          worth: value * parseFloat(toHumanReadableAmount(totalAmountPerDate))
        }
      })

      if (latestWorth !== undefined) dataPoints.push({ date: dayjs().format(CHART_DATE_FORMAT), worth: latestWorth })

      return dataPoints
    }

    const trimInitialZeroDataPoints = (data: DataPoint[]) => data.slice(data.findIndex((point) => point.worth !== 0))

    let dataPoints = computeChartDataPoints()
    dataPoints = trimInitialZeroDataPoints(dataPoints)

    setChartData(getFilteredChartData(dataPoints, startingDate))
  }, [
    addressHash,
    allAddressesHashes,
    alphBalanceHistoryPerAddress,
    alphPriceHistory,
    isDataAvailable,
    latestWorth,
    startingDate
  ])

  if (!isDataAvailable || chartData.length < 2 || !firstItem || latestWorth === undefined) return null

  const xAxisDatesData = chartData.map(({ date }) => date)
  const yAxisWorthData = chartData.map(({ worth }) => worth)

  const worthHasGoneUp = firstItem.worth < latestWorth
  const chartColor = worthHasGoneUp ? theme.global.valid : theme.global.alert

  const chartOptions = getChartOptions(chartColor, xAxisDatesData, {
    mouseMove(e, chart, options) {
      onDataPointHover(options.dataPointIndex === -1 ? undefined : chartData[options.dataPointIndex])
    },
    mouseLeave() {
      onDataPointHover(undefined)
    }
  })

  return (
    <ChartWrapper>
      <Chart options={chartOptions} series={[{ data: yAxisWorthData }]} type="area" width="100%" height="100%" />
    </ChartWrapper>
  )
})

export default HistoricWorthChart

const ChartWrapper = styled.div`
  width: 100%;
  height: ${historicWorthChartHeight}px;
  opacity: 0.3;
  transition: opacity 0.2s ease-out;

  filter: saturate(0);

  &:hover {
    opacity: 1;
    filter: saturate(1);
  }
`
