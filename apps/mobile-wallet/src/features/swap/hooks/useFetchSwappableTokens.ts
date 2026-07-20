import { ONE_MINUTE_MS } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { powfiBackend } from '~/api/powfi'

const useFetchSwappableTokens = (pairedWithTokenId?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['powfi-swappable-tokens', pairedWithTokenId ?? 'all'],
    queryFn: async () => {
      const { data, error } = await powfiBackend.tokens['pool-tokens'].get({
        query: { tokenId: pairedWithTokenId }
      })

      if (error) throw error.value

      return data
    },
    staleTime: 5 * ONE_MINUTE_MS
  })

  return {
    tokenIds: data ?? [],
    isLoading
  }
}

export default useFetchSwappableTokens
