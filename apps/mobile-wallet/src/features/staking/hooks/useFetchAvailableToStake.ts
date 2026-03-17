import { selectDefaultAddressHash } from '@alephium/shared'
import { useFetchAddressBalancesAlph } from '@alephium/shared-react'

import { useAppSelector } from '~/hooks/redux'

const useFetchAvailableToStake = () => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const { data: alphBalances, isLoading } = useFetchAddressBalancesAlph({ addressHash: defaultAddressHash ?? '' })

  return {
    data: BigInt(alphBalances?.availableBalance ?? '0'),
    isLoading
  }
}

export default useFetchAvailableToStake
