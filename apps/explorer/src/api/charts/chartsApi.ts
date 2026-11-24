import { explorer } from '@alephium/web3'
import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'
import { BUCKET_SIZE_MS } from '@/pages/HomePage/timeIntervals'

export const chartsQueries = {
  hashrates: (from: number, to: number, intervalType: explorer.IntervalType) =>
    queryOptions({
      queryKey: ['charts', 'hashrates', intervalType, from, to],
      queryFn: ({ signal }) =>
        client.explorer.charts.getChartsHashrates(
          { fromTs: from, toTs: to, 'interval-type': intervalType },
          { signal }
        ),
      staleTime: BUCKET_SIZE_MS
    }),
  transactionsCount: (from: number, to: number, intervalType: explorer.IntervalType) =>
    queryOptions({
      queryKey: ['charts', 'transactionsCount', intervalType, from, to],
      queryFn: ({ signal }) =>
        client.explorer.charts.getChartsTransactionsCount(
          { fromTs: from, toTs: to, 'interval-type': intervalType },
          { signal }
        ),
      staleTime: BUCKET_SIZE_MS
    })
}
