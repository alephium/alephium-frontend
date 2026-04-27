import { ONE_MINUTE_MS } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { powfiBackend } from '~/api/powfi'

export const useFetchStakingStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['staking-stats'],
    queryFn: async () => {
      const { data, error } = await powfiBackend.stats.staking.get()
      if (error) throw error.value
      return data
    },
    staleTime: 15 * ONE_MINUTE_MS
  })

  return {
    data,
    isLoading
  }
}
