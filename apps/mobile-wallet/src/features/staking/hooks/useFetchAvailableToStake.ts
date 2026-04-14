import { selectDefaultAddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { getPowfiSdk } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'

const useFetchAvailableToStake = () => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const powfi = getPowfiSdk()

  const { data, isLoading } = useQuery({
    queryKey: ['availableToStake', powfi?.network.id, defaultAddressHash],
    queryFn: async () => {
      const balance = await powfi!.nodeProvider.addresses.getAddressesAddressBalance(defaultAddressHash!)
      return BigInt(balance.balance) - BigInt(balance.lockedBalance)
    },
    enabled: !!powfi && !!defaultAddressHash,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  return {
    data: data ?? BigInt(0),
    isLoading
  }
}

export default useFetchAvailableToStake
