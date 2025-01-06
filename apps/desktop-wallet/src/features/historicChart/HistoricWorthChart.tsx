import { AddressHash, CHART_DATE_FORMAT, toHumanReadableAmount } from '@alephium/shared'
import dayjs, { Dayjs } from 'dayjs'
import { motion } from 'framer-motion'
import { memo, useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import styled, { css, useTheme } from 'styled-components'

import useFetchWalletWorthAlph from '@/api/apiDataHooks/wallet/useFetchWalletWorthAlph'
import { ChartLength, DataPoint, LatestAmountPerAddress } from '@/features/historicChart/historicChartTypes'
import { getChartOptions, getFilteredChartData } from '@/features/historicChart/historicChartUtils'
import useHistoricData from '@/features/historicChart/useHistoricData'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

interface HistoricWorthChartProps {
  onDataPointHover: (dataPoint?: DataPoint) => void
  onWorthInBeginningOfChartChange: (worthInBeginningOfChart?: DataPoint['worth']) => void
  chartVisible?: boolean
  chartInitiallyHidden?: boolean
  addressHash?: AddressHash
}

export const historicWorthChartHeight = 100

const chartAnimationVariants = {
  shown: { height: historicWorthChartHeight, opacity: 1 },
  hidden: { height: 0, opacity: 0 }
}

const now = dayjs()
const startingDates: Record<ChartLength, Dayjs> = {
  '1d': now.subtract(1, 'day'),
  '1w': now.subtract(1, 'week'),
  '1m': now.subtract(1, 'month'),
  '1y': now.subtract(1, 'year')
}

const HistoricWorthChart = memo(
  ({
    chartVisible,
    chartInitiallyHidden,
    addressHash,
    onDataPointHover,
    onWorthInBeginningOfChartChange
  }: HistoricWorthChartProps) => {
    const theme = useTheme()
    const discreetMode = useAppSelector((s) => s.settings.discreetMode)
    const length = useAppSelector((s) => s.historicWorthChart.chartLength)
    const allAddressesHashes = useUnsortedAddressesHashes()
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

    const shouldHideChart = !isDataAvailable || chartData.length < 2 || !firstItem || latestWorth === undefined

    const xAxisDatesData = chartData.map(({ date }) => date)
    const yAxisWorthData = chartData.map(({ worth }) => worth)

    const worthHasGoneUp = (firstItem?.worth ?? 0) < latestWorth
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
      <ChartOuterContainer
        chartInitiallyHidden={chartInitiallyHidden}
        variants={chartAnimationVariants}
        animate={chartVisible && !discreetMode && !shouldHideChart ? 'shown' : 'hidden'}
      >
        <ChartInnerContainer animate={{ opacity: discreetMode ? 0 : 1 }} transition={{ duration: 0.5 }}>
          <ChartWrapper>
            <Chart options={chartOptions} series={[{ data: yAxisWorthData }]} type="area" width="100%" height="100%" />
          </ChartWrapper>
        </ChartInnerContainer>
      </ChartOuterContainer>
    )
  }
)

export default HistoricWorthChart

const ChartOuterContainer = styled(motion.div)<Pick<HistoricWorthChartProps, 'chartInitiallyHidden'>>`
  display: flex;
  align-items: center;
  right: 0;
  left: 0;
  margin: var(--spacing-4) 0;

  ${({ chartInitiallyHidden }) =>
    chartInitiallyHidden &&
    css`
      height: 0;
    `}

  overflow: hidden;
`

const ChartInnerContainer = styled(motion.div)`
  height: 100%;
  width: 100%;
`

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
