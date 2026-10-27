import { OnramperSignedParams } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { postJson } from '../fetchUtils'

export const useFetchOnramperSignature = (addressHash: AddressHash) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['onramper-signature-v2', addressHash],

    queryFn: async () =>
      postJson<OnramperSignedParams>('https://onramper.alephium.org/sign', {
        address: addressHash
      }),

    gcTime: 0
  })

  return {
    data,
    isLoading,
    error
  }
}
