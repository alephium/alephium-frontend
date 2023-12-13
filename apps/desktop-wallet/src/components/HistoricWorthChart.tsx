/*
Copyright 2018 - 2023 The Alephium Authors
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

import { AddressHash, toHumanReadableAmount } from '@alephium/shared'
import { colord } from 'colord'
import dayjs, { Dayjs } from 'dayjs'
import { memo, useEffect, useMemo, useState } from 'react'
import Chart from 'react-apexcharts'
import styled, { useTheme } from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import {
  makeSelectAddresses,
  selectHaveHistoricBalancesLoaded,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { useGetHistoricalPriceQuery } from '@/storage/assets/priceApiSlice'
import { ChartLength, DataPoint, LatestAmountPerAddress } from '@/types/chart'
import { Currency } from '@/types/settings'
import { CHART_DATE_FORMAT } from '@/utils/constants'

interface HistoricWorthChartProps {
  currency: Currency
  length: ChartLength
  onDataPointHover: (dataPoint?: DataPoint) => void
  onWorthInBeginningOfChartChange: (worthInBeginningOfChart?: DataPoint['worth']) => void
  latestWorth?: number
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

// Note: It's necessary to wrap in memo, otherwise the chart rerenders everytime onDataPointHover is called because the
// state of the parent component changes
const HistoricWorthChart = memo(function HistoricWorthChart({
  addressHash,
  latestWorth,
  currency,
  length = '1y',
  onDataPointHover,
  onWorthInBeginningOfChartChange
}: HistoricWorthChartProps) {
  const selectAddresses = useMemo(makeSelectAddresses, [])
  const addresses = useAppSelector((s) => selectAddresses(s, addressHash ?? (s.addresses.ids as AddressHash[])))
  const haveHistoricBalancesLoaded = useAppSelector(selectHaveHistoricBalancesLoaded)
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)

  const { data: alphPriceHistory } = useGetHistoricalPriceQuery({ currency, days: 365 })

  const theme = useTheme()

  const [chartData, setChartData] = useState<DataPoint[]>([])

  const startingDate = startingDates[length].format('YYYY-MM-DD')
  const isDataAvailable = addresses.length !== 0 && haveHistoricBalancesLoaded && !!alphPriceHistory
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

      const dataPoints = alphPriceHistory.map(({ date, price }) => {
        let totalAmountPerDate = BigInt(0)

        addresses.forEach(({ hash, balanceHistory }) => {
          const amountOnDate = balanceHistory.entities[date]?.balance

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
          worth: price * parseFloat(toHumanReadableAmount(totalAmountPerDate))
        }
      })

      if (latestWorth !== undefined) dataPoints.push({ date: dayjs().format(CHART_DATE_FORMAT), worth: latestWorth })

      return dataPoints
    }

    const trimInitialZeroDataPoints = (data: DataPoint[]) => data.slice(data.findIndex((point) => point.worth !== 0))

    let dataPoints = computeChartDataPoints()
    dataPoints = trimInitialZeroDataPoints(dataPoints)

    setChartData(getFilteredChartData(dataPoints, startingDate))
  }, [addresses, alphPriceHistory, isDataAvailable, latestWorth, startingDate])

  if (!isDataAvailable || chartData.length < 2 || !firstItem || latestWorth === undefined) return null

  const xAxisDatesData = chartData.map(({ date }) => date)
  const yAxisWorthData = chartData.map(({ worth }) => worth)

  const worthHasGoneUp = firstItem.worth < latestWorth
  const chartColor = stateUninitialized ? theme.font.tertiary : worthHasGoneUp ? theme.global.valid : theme.global.alert

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

const getFilteredChartData = (chartData: DataPoint[], startingDate: string) => {
  const startingPoint = chartData.findIndex((point) => point.date === startingDate)
  return startingPoint > 0 ? chartData.slice(startingPoint) : chartData
}

const getChartOptions = (
  chartColor: string,
  xAxisData: string[],
  events: ApexChart['events']
): ApexCharts.ApexOptions => ({
  chart: {
    id: 'alephium-chart',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    sparkline: {
      enabled: true
    },
    events,
    animations: {
      enabled: false,
      easing: 'easeout',
      speed: 500,
      dynamicAnimation: {
        enabled: false
      }
    }
  },
  xaxis: {
    type: 'datetime',
    categories: xAxisData,
    axisTicks: {
      show: false
    },
    axisBorder: {
      show: false
    },
    tooltip: {
      enabled: false
    },
    labels: {
      show: false
    },
    crosshairs: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0
    }
  },
  stroke: {
    curve: 'smooth',
    colors: [chartColor],
    width: 2
  },
  tooltip: {
    custom: () => null,
    fixed: {
      enabled: true
    }
  },
  markers: {
    colors: [chartColor],
    strokeColors: [chartColor],
    hover: {
      size: 4
    }
  },
  dataLabels: {
    enabled: false
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      colorStops: [
        [
          {
            offset: 0,
            color: colord(chartColor).alpha(0.3).toHex(),
            opacity: 1
          },
          {
            offset: 100,
            color: colord(chartColor).alpha(0).toHex(),
            opacity: 1
          }
        ]
      ]
    }
  }
})

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
