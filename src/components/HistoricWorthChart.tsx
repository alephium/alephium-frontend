/*
Copyright 2018 - 2022 The Alephium Authors
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

import { toHumanReadableAmount } from '@alephium/sdk'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Defs, LinearGradient, Stop, Svg } from 'react-native-svg'
import { useTheme } from 'styled-components/native'
import { VictoryArea } from 'victory-native'

import { useAppSelector } from '~/hooks/redux'
import { selectHaveHistoricBalancesLoaded, selectIsStateUninitialized } from '~/store/addresses/addressesSelectors'
import { selectAllAddresses } from '~/store/addressesSlice'
import { HistoricalPriceResult, useGetHistoricalPriceQuery } from '~/store/assets/priceApiSlice'
import { Address } from '~/types/addresses'
import { ChartLength, DataPoint, LatestAmountPerAddress } from '~/types/charts'
import { Currency } from '~/types/settings'

interface HistoricWorthChart {
  length?: ChartLength
  latestWorth: number
  currency: Currency
  onWorthInBeginningOfChartChange: (worthInBeginningOfChart?: DataPoint['worth']) => void
  style?: StyleProp<ViewStyle>
}

const now = dayjs()
const startingDates: Record<ChartLength, Dayjs> = {
  '1d': now.subtract(1, 'day'),
  '1w': now.subtract(1, 'week'),
  '1m': now.subtract(1, 'month'),
  '1y': now.subtract(1, 'year')
}

const HistoricWorthChart = ({
  length = '1m',
  latestWorth,
  currency,
  onWorthInBeginningOfChartChange,
  style
}: HistoricWorthChart) => {
  const theme = useTheme()
  const { data: alphPriceHistory } = useGetHistoricalPriceQuery({ currency, days: 365 })
  const addresses = useAppSelector(selectAllAddresses)
  const haveHistoricBalancesLoaded = useAppSelector(selectHaveHistoricBalancesLoaded)
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)

  const [chartData, setChartData] = useState<DataPoint[]>([])

  const startingDate = startingDates[length].format('YYYY-MM-DD')
  const isDataAvailable = addresses.length !== 0 && haveHistoricBalancesLoaded && !!alphPriceHistory
  const filteredChartData = getFilteredChartData(chartData, startingDate)
  const firstItem = filteredChartData.at(0)

  useEffect(() => {
    onWorthInBeginningOfChartChange(firstItem?.worth)
  }, [firstItem?.worth, onWorthInBeginningOfChartChange])

  useEffect(() => {
    setChartData(isDataAvailable ? trimInitialZeroDataPoints(computeChartDataPoints(alphPriceHistory, addresses)) : [])
  }, [addresses, alphPriceHistory, isDataAvailable])

  if (!isDataAvailable || chartData.length <= 2 || !firstItem) return null

  const worthHasGoneUp = firstItem.worth < latestWorth
  const chartColor = stateUninitialized ? theme.font.tertiary : worthHasGoneUp ? theme.global.valid : theme.global.alert

  const data = filteredChartData.map(({ date, worth }) => ({
    x: date,
    y: worth
  }))

  return (
    <View style={style}>
      <Svg height={100}>
        <Defs>
          <LinearGradient id="gradientBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={theme.bg.primary} />
          </LinearGradient>
        </Defs>
        <VictoryArea
          data={data}
          interpolation="basis"
          height={100}
          padding={0}
          standalone={false}
          animate
          style={{
            data: {
              fill: 'url(#gradientBg)',
              stroke: chartColor,
              strokeWidth: 2
            }
          }}
        />
      </Svg>
    </View>
  )
}

export default HistoricWorthChart

const getFilteredChartData = (chartData: DataPoint[], startingDate: string) => {
  const startingPoint = chartData.findIndex((point) => point.date === startingDate)
  return startingPoint > 0 ? chartData.slice(startingPoint) : chartData
}

const trimInitialZeroDataPoints = (data: DataPoint[]) => data.slice(data.findIndex((point) => point.worth !== 0))

const computeChartDataPoints = (alphPriceHistory: HistoricalPriceResult[], addresses: Address[]): DataPoint[] => {
  const addressesLatestAmount: LatestAmountPerAddress = {}

  return alphPriceHistory.map(({ date, price }) => {
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
}
