import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'

export const infosQueries = {
  all: {
    heights: () =>
      queryOptions({
        queryKey: ['heights'],
        queryFn: client.explorer.infos.getInfosHeights
      })
  }
}
