import { explorer } from '@alephium/web3'
import { useCallback, useEffect, useState } from 'react'

import client from '@/api/client'

import { getHashrateTimeInterval, getTimeIntervals } from './timeIntervals'

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

  const [now, setNow] = useState(() => Date.now())

  const { from: hashrateFrom, to: hashrateTo } = getHashrateTimeInterval(now)
  const { from: chartFrom, to: chartTo } = getTimeIntervals(timeInterval, now)

  const updateStatsScalar = (key: StatScalarKeys, value: StatScalar['value']) => {
    setStatsScalarData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  const updateStatsVector = (key: StatVectorKeys, value: StatVector['value']) => {
    setStatsVectorData((prevState) => ({ ...prevState, [key]: { value, isLoading: false } }))
  }

  const fetchScalarStats = useCallback(() => {
    const fetchAndUpdateStatsScalar = async (key: StatScalarKeys, fetchCall: () => Promise<number>) => {
      const result = await fetchCall()
      if (result) updateStatsScalar(key, typeof result === 'string' ? parseInt(result) : result)
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

    fetchBlocksData()
    fetchAvgBlockTimeData()
    fetchAndUpdateStatsScalar('totalSupply', client.explorer.infos.getInfosSupplyTotalAlph)
    fetchAndUpdateStatsScalar('circulatingSupply', client.explorer.infos.getInfosSupplyCirculatingAlph)
    fetchAndUpdateStatsScalar('totalTransactions', client.explorer.infos.getInfosTotalTransactions)
  }, [])

  const fetchHashrateStat = useCallback(async () => {
    const data = await client.explorer.charts.getChartsHashrates({
      fromTs: hashrateFrom,
      toTs: hashrateTo,
      'interval-type': explorer.IntervalType.Hourly
    })

    if (data && data.length > 0) updateStatsScalar('hashrate', Number(data[data.length - 1].value))
  }, [hashrateFrom, hashrateTo])

  const fetchChartStats = useCallback(async () => {
    const fetchTxVectorData = async () => {
      const data = await client.explorer.charts.getChartsTransactionsCount({
        fromTs: chartFrom,
        toTs: chartTo,
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
      const data = await client.explorer.charts.getChartsHashrates({
        fromTs: chartFrom,
        toTs: chartTo,
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

    fetchTxVectorData()
    fetchHashrateVectorData()
  }, [chartFrom, chartTo, timeInterval])

  useEffect(() => {
    fetchScalarStats()
  }, [fetchScalarStats])

  // These two effects are keyed on the bucketed boundaries rather than on the poll, so the chart endpoints are hit
  // once per bucket instead of on every tick, and always on a URL that is shared with every other viewer.
  useEffect(() => {
    fetchHashrateStat()
  }, [fetchHashrateStat])

  useEffect(() => {
    fetchChartStats()
  }, [fetchChartStats])

  const refreshStatistics = useCallback(() => {
    fetchScalarStats()
    setNow(Date.now())
  }, [fetchScalarStats])

  const { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime } = statsScalarData

  const { txVector, hashrateVector } = statsVectorData

  return {
    refreshStatistics,
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
