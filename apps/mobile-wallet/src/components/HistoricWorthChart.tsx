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

import { CHART_DATE_FORMAT, toHumanReadableAmount } from '@alephium/shared'
import { colord } from 'colord'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Defs, LinearGradient, Stop, Svg } from 'react-native-svg'
import styled, { useTheme } from 'styled-components/native'
import { VictoryArea } from 'victory-native'

import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AppText from '~/components/AppText'
import WorthDelta from '~/components/WorthDelta'
import { useAppSelector } from '~/hooks/redux'
import useWorthDelta from '~/hooks/useWorthDelta'
import { selectHaveHistoricBalancesLoaded } from '~/store/addresses/addressesSelectors'
import { selectAllAddresses } from '~/store/addressesSlice'
import { HistoricalPriceResult, useGetHistoricalPriceQuery } from '~/store/assets/priceApiSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { Address } from '~/types/addresses'
import { ChartLength, chartLengths, DataPoint, LatestAmountPerAddress } from '~/types/charts'
import { Currency } from '~/types/settings'

interface HistoricWorthChart {
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

const chartHeight = 70
const chartIntervalsRowHeight = 30
const chartItemsMargin = 15

const HistoricWorthChart = ({ latestWorth, currency, onWorthInBeginningOfChartChange, style }: HistoricWorthChart) => {
  const theme = useTheme()
  const { data: alphPriceHistory } = useGetHistoricalPriceQuery({ currency, days: 365 })
  const addresses = useAppSelector(selectAllAddresses)
  const haveHistoricBalancesLoaded = useAppSelector(selectHaveHistoricBalancesLoaded)

  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [chartLength, setChartLength] = useState<ChartLength>('1m')

  const startingDate = startingDates[chartLength].format('YYYY-MM-DD')
  const isDataAvailable = addresses.length !== 0 && haveHistoricBalancesLoaded && !!alphPriceHistory
  const filteredChartData = getFilteredChartData(chartData, startingDate)
  const firstItem = filteredChartData.length > 0 ? filteredChartData[0] : undefined
  const worthDelta = useWorthDelta(firstItem?.worth)

  const isLoading = filteredChartData.length === 0

  const animatedStyle = useAnimatedStyle(() => ({
    height: isLoading
      ? 0
      : withSpring(chartHeight + chartIntervalsRowHeight + chartItemsMargin, defaultSpringConfiguration),
    marginBottom: withSpring(10)
  }))

  useEffect(() => {
    onWorthInBeginningOfChartChange(firstItem?.worth)
  }, [firstItem?.worth, onWorthInBeginningOfChartChange])

  useEffect(() => {
    setChartData(
      isDataAvailable ? trimInitialZeroDataPoints(computeChartDataPoints(alphPriceHistory, addresses, latestWorth)) : []
    )
  }, [addresses, alphPriceHistory, isDataAvailable, latestWorth])

  const worthHasGoneUp = firstItem?.worth ? firstItem.worth < latestWorth : undefined

  const chartColor = colord(
    worthHasGoneUp === undefined ? theme.font.tertiary : worthHasGoneUp ? theme.global.valid : theme.global.alert
  )

  const data =
    filteredChartData.length > 0
      ? filteredChartData.map(({ date, worth }) => ({
          x: date,
          y: worth
        }))
      : undefined

  if (!data || data.length < 2) return null

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Row style={{ marginBottom: chartItemsMargin }}>
        {haveHistoricBalancesLoaded && (
          <DeltaAndChartLengths entering={FadeIn}>
            <WorthDelta delta={worthDelta} />
            <ChartLengthBadges>
              {chartLengths.map((length) => {
                const isActive = length === chartLength

                return (
                  <ChartLengthButton key={length} isActive={isActive} onPress={() => setChartLength(length)}>
                    <AppText color={isActive ? 'contrast' : 'secondary'} size={14} medium>
                      {length.toUpperCase()}
                    </AppText>
                  </ChartLengthButton>
                )
              })}
            </ChartLengthBadges>
          </DeltaAndChartLengths>
        )}
      </Row>
      <Svg height={chartHeight}>
        <Defs>
          <LinearGradient id="gradientBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={chartColor.toHex()} stopOpacity={0.1} />
            <Stop offset="75%" stopColor={chartColor.toHex()} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {data && (
          <VictoryArea
            data={data}
            interpolation="basis"
            height={chartHeight}
            padding={0}
            standalone={false}
            animate
            style={{
              data: {
                fill: 'url(#gradientBg)',
                stroke: chartColor.alpha(0.5).toHex(),
                strokeWidth: 2
              }
            }}
          />
        )}
      </Svg>
    </Animated.View>
  )
}

export default HistoricWorthChart

const getFilteredChartData = (chartData: DataPoint[], startingDate: string) => {
  const startingPoint = chartData.findIndex((point) => point.date === startingDate)
  return startingPoint > 0 ? chartData.slice(startingPoint) : chartData
}

const trimInitialZeroDataPoints = (data: DataPoint[]) => data.slice(data.findIndex((point) => point.worth !== 0))

const computeChartDataPoints = (
  alphPriceHistory: HistoricalPriceResult[],
  addresses: Address[],
  latestWorth: number
): DataPoint[] => {
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

const DeltaAndChartLengths = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
  margin: 0 ${DEFAULT_MARGIN}px;
`

const ChartLengthBadges = styled.View`
  flex-direction: row;
  gap: 6px;
`

const ChartLengthButton = styled.Pressable<{ isActive?: boolean }>`
  width: 32px;
  height: 23px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  background-color: ${({ isActive, theme }) => (isActive ? theme.font.secondary : 'transparent')};
`

const Row = styled.View`
  flex-direction: row;
  gap: 24px;
  margin: 0px ${DEFAULT_MARGIN}px 5px;
  height: ${chartIntervalsRowHeight}px;
`
