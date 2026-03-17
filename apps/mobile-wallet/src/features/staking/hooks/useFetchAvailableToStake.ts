import { useFetchWalletBalancesAlph } from '@alephium/shared-react'

const useFetchAvailableToStake = () => {
  const { data: alphBalances, isLoading } = useFetchWalletBalancesAlph()

  return {
    data: BigInt(alphBalances?.availableBalance ?? '0'),
    isLoading
  }
}

export default useFetchAvailableToStake
