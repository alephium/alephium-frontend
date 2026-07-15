import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'

const CHAIN_HEIGHTS_REFETCH_INTERVAL = 10000

export const infosQueries = {
  all: {
    // Keep polling while the page is open, including after the tx confirms, so the confirmation count keeps advancing.
    heights: (isAppVisible = true) =>
      queryOptions({
        queryKey: ['heights'],
        queryFn: client.explorer.infos.getInfosHeights,
        refetchInterval: isAppVisible ? CHAIN_HEIGHTS_REFETCH_INTERVAL : undefined
      })
  }
}
