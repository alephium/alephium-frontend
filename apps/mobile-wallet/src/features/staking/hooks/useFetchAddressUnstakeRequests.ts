import { selectDefaultAddress } from '@alephium/shared'
import { addressWithoutExplicitGroupIndex } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'

import { powfiSdk } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'

export interface UnstakeRequest {
  vaultIndex: bigint
  claimableAmount: bigint
  totalAmount: bigint
  startTime: bigint
  duration: bigint
  withdrawnAmount: bigint
  contractAddress: string
}

export const unstakeVaultRequestsQueryKeyRoot = ['unstakeVaultRequests'] as const

const useFetchAddressUnstakeRequests = () => {
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const address = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : undefined
  const shouldFetch = !!address

  const { data, error, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: [...unstakeVaultRequestsQueryKeyRoot, powfiSdk.network.id, address],
    queryFn: async () => {
      const userAddress = address!
      const activeIndexes = await powfiSdk.staking.getActiveUnstakeVaultIndexes(userAddress)

      if (!activeIndexes.length) return []

      return Promise.all(
        activeIndexes.map(async (index) => {
          const [claimableAmount, state] = await Promise.all([
            powfiSdk.staking.getClaimableAmount(userAddress, index),
            powfiSdk.staking.getAlphUnstakeVaultState(userAddress, index)
          ])

          return {
            vaultIndex: index,
            claimableAmount,
            totalAmount: state.fields.totalUnstakeAmount,
            startTime: state.fields.unstakeStartTime,
            duration: state.fields.unstakeDuration,
            withdrawnAmount: state.fields.withdrawnAmount,
            contractAddress: state.address
          } satisfies UnstakeRequest
        })
      )
    },
    enabled: shouldFetch,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  return {
    data: data ?? [],
    error,
    isError,
    isLoading,
    isRefetching,
    refetch
  }
}

export default useFetchAddressUnstakeRequests
