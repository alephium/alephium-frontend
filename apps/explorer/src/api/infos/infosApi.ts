import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'

const CHAIN_HEIGHTS_REFETCH_INTERVAL = 10000

export const infosQueries = {
  all: {
    // Keep polling while the page is open, including after the tx confirms, so the confirmation count keeps advancing.
    heights: (isAppVisible = true) =>
      queryOptions({
        queryKey: ['heights'],
        queryFn: ({ signal }) => client.explorer.infos.getInfosHeights({ signal }),
        refetchInterval: isAppVisible ? CHAIN_HEIGHTS_REFETCH_INTERVAL : undefined
      }),
    averageBlockTimes: () =>
      queryOptions({
        queryKey: ['infos', 'averageBlockTimes'],
        queryFn: ({ signal }) => client.explorer.infos.getInfosAverageBlockTimes({ signal })
      }),
    totalSupply: () =>
      queryOptions({
        queryKey: ['infos', 'totalSupply'],
        queryFn: ({ signal }) => client.explorer.infos.getInfosSupplyTotalAlph({ signal })
      }),
    circulatingSupply: () =>
      queryOptions({
        queryKey: ['infos', 'circulatingSupply'],
        queryFn: ({ signal }) => client.explorer.infos.getInfosSupplyCirculatingAlph({ signal })
      }),
    totalTransactions: () =>
      queryOptions({
        queryKey: ['infos', 'totalTransactions'],
        queryFn: ({ signal }) => client.explorer.infos.getInfosTotalTransactions({ signal })
      })
  }
}
