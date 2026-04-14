import { selectDefaultAddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { getPowfiSdk } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'

import useXAlphTokenId from './useXAlphTokenId'

const useFetchXAlphBalance = () => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const powfi = getPowfiSdk()
  const xAlphTokenId = useXAlphTokenId()

  const { data, isLoading } = useQuery({
    queryKey: ['xAlphBalance', powfi?.network.id, defaultAddressHash, xAlphTokenId],
    queryFn: async () => {
      const balance = await powfi!.nodeProvider.addresses.getAddressesAddressBalance(defaultAddressHash!)
      return balance.tokenBalances?.find(({ id }) => id === xAlphTokenId)?.amount
    },
    enabled: !!powfi && !!defaultAddressHash && !!xAlphTokenId,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  return {
    data: data ? BigInt(data) : BigInt(0),
    isLoading
  }
}

export default useFetchXAlphBalance
