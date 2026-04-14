import { AddressHash, getOnramperSignContent } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { postJson } from '../fetchUtils'

export const useFetchOnramperSignature = (addressHash: AddressHash) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['onramper-signature', addressHash],

    queryFn: async () =>
      postJson<string>('https://onramper.alephium.org/sign', {
        data: getOnramperSignContent(addressHash)
      })
  })

  return {
    data,
    isLoading,
    error
  }
}
