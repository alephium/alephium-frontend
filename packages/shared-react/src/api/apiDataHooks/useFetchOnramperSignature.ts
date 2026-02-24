import { AddressHash, getOnramperSignContent, ONE_DAY_MS } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { getQueryConfig } from '@/api/apiUtils'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'

export const useFetchOnramperSignature = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading, error } = useQuery({
    queryKey: ['onramper-signature', addressHash],
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: ONE_DAY_MS, networkId }),
    queryFn: async () => {
      const { data } = await axios.post('https://onramper.alephium.org/sign', {
        data: getOnramperSignContent(addressHash)
      })

      return data
    }
  })

  return {
    data,
    isLoading,
    error
  }
}
