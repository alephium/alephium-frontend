import { AddressHash, getOnramperSignContent } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useFetchOnramperSignature = (addressHash: AddressHash) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['onramper-signature', addressHash],

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
