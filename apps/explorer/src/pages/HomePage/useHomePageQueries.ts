import { explorer } from '@alephium/web3'
import { keepPreviousData, useQuery, UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'

import { queries } from '@/api'
import useInterval from '@/hooks/useInterval'

import { floorToBucket, getHashrateTimeInterval, getTimeIntervals } from './timeIntervals'

export const BLOCKS_PER_PAGE = 10
// Keep the newer block-list cadence: the backend indexes blocks roughly every five seconds.
export const BLOCKS_REFRESH_INTERVAL = 5000
const STATS_REFRESH_INTERVAL = 10000
const emptyVector = { series: [], categories: [] }

const stat = <T>(query: UseQueryResult<T>, fallback: T) => ({
  value: query.data ?? fallback,
  isLoading: query.isPending,
  isError: query.isError
})

const totalHeights = (data: explorer.PerChainHeight[]) => data.reduce((total, { value }) => total + value, 0)
const averageBlockTime = (data: explorer.PerChainDuration[]) =>
  data.length ? data.reduce((total, { value }) => total + value, 0) / data.length : 0
const lastHashrate = (data: explorer.Hashrate[]) => Number(data.at(-1)?.value ?? 0)
const hashrateSeries = (data: explorer.Hashrate[]) => ({
  categories: data.map(({ timestamp }) => timestamp),
  series: data.map(({ hashrate }) => hashrate)
})
const transactionSeries = (data: explorer.TimedCount[]) => ({
  categories: data.map(({ timestamp }) => timestamp),
  series: data.map(({ totalCountAllChains }) => totalCountAllChains)
})

export const useHomePageStatistics = (timeInterval: explorer.IntervalType, isAppVisible: boolean) => {
  const [now, setNow] = useState(() => floorToBucket(Date.now()))
  // This ticker only changes query keys. It never fetches: observers dedupe a shared bucket automatically.
  useInterval(() => setNow(floorToBucket(Date.now())), STATS_REFRESH_INTERVAL, !isAppVisible)
  // On becoming visible, use the current bucket immediately rather than briefly enabling the old key.
  const bucketNow = isAppVisible ? floorToBucket(Date.now()) : now
  const { from, to } = getTimeIntervals(timeInterval, bucketNow)
  const hashrateRange = getHashrateTimeInterval(bucketNow)
  const polling = { enabled: isAppVisible, refetchInterval: isAppVisible ? STATS_REFRESH_INTERVAL : (false as const) }
  const charts = { enabled: isAppVisible, placeholderData: keepPreviousData }
  const hashrate = useQuery({
    ...queries.charts.hashrates(hashrateRange.from, hashrateRange.to, explorer.IntervalType.Hourly),
    ...charts,
    select: lastHashrate
  })
  const totalBlocks = useQuery({ ...queries.infos.all.heights(), ...polling, select: totalHeights })
  const avgBlockTime = useQuery({ ...queries.infos.all.averageBlockTimes(), ...polling, select: averageBlockTime })
  const totalSupply = useQuery({ ...queries.infos.all.totalSupply(), ...polling, select: Number })
  const circulatingSupply = useQuery({ ...queries.infos.all.circulatingSupply(), ...polling, select: Number })
  const totalTransactions = useQuery({ ...queries.infos.all.totalTransactions(), ...polling })
  const txVector = useQuery({
    ...queries.charts.transactionsCount(from, to, timeInterval),
    ...charts,
    select: transactionSeries
  })
  const hashrateVector = useQuery({
    ...queries.charts.hashrates(from, to, timeInterval),
    ...charts,
    select: hashrateSeries
  })

  return {
    scalar: {
      hashrate: stat(hashrate, 0),
      totalBlocks: stat(totalBlocks, 0),
      avgBlockTime: stat(avgBlockTime, 0),
      totalSupply: stat(totalSupply, 0),
      circulatingSupply: stat(circulatingSupply, 0),
      totalTransactions: stat(totalTransactions, 0)
    },
    vector: { txVector: stat(txVector, emptyVector), hashrateVector: stat(hashrateVector, emptyVector) }
  }
}

export const useHomePageBlocks = (page: number, isAppVisible: boolean) => {
  const query = useQuery({
    ...queries.blocks.list(page, BLOCKS_PER_PAGE),
    enabled: isAppVisible,
    refetchInterval: page === 1 && isAppVisible ? BLOCKS_REFRESH_INTERVAL : false,
    placeholderData: keepPreviousData
  })
  const [previous, setPrevious] = useState({ page, data: query.data, newBlockHashes: new Set<string>() })
  // Preserve the first-page arrival highlight without treating paging or placeholder data as new blocks.
  if (previous.page !== page || (!query.isPlaceholderData && previous.data !== query.data)) {
    const oldHashes = new Set(previous.data?.blocks?.map(({ hash }) => hash))
    setPrevious({
      page,
      data: query.isPlaceholderData ? undefined : query.data,
      newBlockHashes:
        page === 1 && previous.page === page && previous.data && !query.isPlaceholderData
          ? new Set(query.data?.blocks?.filter(({ hash }) => !oldHashes.has(hash)).map(({ hash }) => hash))
          : new Set()
    })
  }

  return {
    blockList: query.data,
    blockPageLoading: query.isPending,
    isError: query.isError,
    newBlockHashes: previous.newBlockHashes
  }
}
