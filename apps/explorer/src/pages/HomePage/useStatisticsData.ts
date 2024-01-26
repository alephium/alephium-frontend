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

import { explorer } from '@alephium/web3'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'

import client from '@/api/client'

const ONE_DAY = 1000 * 60 * 60 * 24

interface Stat<T> {
  value: T
  isLoading: boolean
}

type StatScalar = Stat<number>
type StatScalarKeys =
  | 'hashrate'
  | 'totalSupply'
  | 'circulatingSupply'
  | 'totalTransactions'
  | 'totalBlocks'
  | 'avgBlockTime'

type StatVector = Stat<{ categories: number[]; series: number[] }>
type StatVectorKeys = 'txVector' | 'hashrateVector'

type StatsScalarData = { [key in StatScalarKeys]: StatScalar }
type StatsVectorData = { [key in StatVectorKeys]: StatVector }

const statScalarDefault = { value: 0, isLoading: true }
const statVectorDefault = { value: { categories: [], series: [] }, isLoading: true }

const getTimeIntervals = (timeInterval: explorer.IntervalType) => ({
  from:
    timeInterval === explorer.IntervalType.Daily
      ? dayjs().subtract(1, 'month').valueOf()
      : dayjs().subtract(2, 'day').valueOf(),
  to: dayjs().valueOf()
})

const useStatisticsData = (timeInterval: explorer.IntervalType) => {
  const [statsScalarData, setStatsScalarData] = useState<StatsScalarData>({
    hashrate: statScalarDefault,
    totalSupply: statScalarDefault,
    circulatingSupply: statScalarDefault,
    totalTransactions: statScalarDefault,
    totalBlocks: statScalarDefault,
    avgBlockTime: statScalarDefault
  })

  const [statsVectorData, setStatsVectorData] = useState<StatsVectorData>({
    txVector: statVectorDefault,
    hashrateVector: statVectorDefault
  })

  const updateStatsScalar = (key: StatScalarKeys, value: StatScalar['value']) => {
    setStatsScalarData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  const updateStatsVector = (key: StatVectorKeys, value: StatVector['value']) => {
    setStatsVectorData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  const fetchStatistics = useCallback(() => {
    if (!client) return

    const fetchAndUpdateStatsScalar = async (key: StatScalarKeys, fetchCall: () => Promise<number>) => {
      const result = await fetchCall()
      if (result) updateStatsScalar(key, typeof result === 'string' ? parseInt(result) : result)
    }

    const fetchHashrateData = async () => {
      const now = new Date().getTime()
      const yesterday = now - ONE_DAY

      const data = await client.explorer.charts.getChartsHashrates({
        fromTs: yesterday,
        toTs: now,
        'interval-type': explorer.IntervalType.Hourly
      })

      if (data && data.length > 0) updateStatsScalar('hashrate', Number(data[data.length - 1].value))
    }

    const fetchBlocksData = async () => {
      const data = await client.explorer.infos.getInfosHeights()
      if (data && data.length > 0)
        updateStatsScalar(
          'totalBlocks',
          data.reduce((acc: number, { value }) => acc + value, 0)
        )
    }

    const fetchAvgBlockTimeData = async () => {
      const data = await client.explorer.infos.getInfosAverageBlockTimes()
      if (data && data.length > 0)
        updateStatsScalar('avgBlockTime', data.reduce((acc: number, { value }) => acc + value, 0.0) / data.length)
    }

    const fetchTxVectorData = async () => {
      const timeIntervals = getTimeIntervals(timeInterval)
      const data = await client.explorer.charts.getChartsTransactionsCount({
        fromTs: timeIntervals.from,
        toTs: timeIntervals.to,
        'interval-type': timeInterval
      })
      if (data && data.length > 0)
        updateStatsVector(
          'txVector',
          data.reduce(
            (acc, { timestamp, totalCountAllChains }) => {
              acc.categories.push(timestamp)
              acc.series.push(totalCountAllChains)
              return acc
            },
            {
              series: [],
              categories: []
            } as { series: number[]; categories: number[] }
          )
        )
    }

    const fetchHashrateVectorData = async () => {
      const timeIntervals = getTimeIntervals(timeInterval)

      const data = await client.explorer.charts.getChartsHashrates({
        fromTs: timeIntervals.from,
        toTs: timeIntervals.to,
        'interval-type': timeInterval
      })
      if (data && data.length > 0)
        updateStatsVector(
          'hashrateVector',
          data.reduce(
            (acc, { timestamp, hashrate }) => {
              acc.categories.push(timestamp)
              acc.series.push(hashrate)
              return acc
            },
            {
              series: [],
              categories: []
            } as { series: number[]; categories: number[] }
          )
        )
    }

    fetchHashrateData()
    fetchBlocksData()
    fetchAvgBlockTimeData()
    fetchTxVectorData()
    fetchHashrateVectorData()
    fetchAndUpdateStatsScalar('totalSupply', client.explorer.infos.getInfosSupplyTotalAlph)
    fetchAndUpdateStatsScalar('circulatingSupply', client.explorer.infos.getInfosSupplyCirculatingAlph)
    fetchAndUpdateStatsScalar('totalTransactions', client.explorer.infos.getInfosTotalTransactions)
  }, [timeInterval])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime } = statsScalarData

  const { txVector, hashrateVector } = statsVectorData

  return {
    fetchStatistics,
    data: {
      scalar: {
        hashrate,
        totalSupply,
        circulatingSupply,
        totalTransactions,
        totalBlocks,
        avgBlockTime
      },
      vector: {
        txVector,
        hashrateVector
      }
    }
  }
}

export default useStatisticsData
