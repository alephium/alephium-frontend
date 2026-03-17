import { selectDefaultAddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '~/hooks/redux'

import usePowfiSdk from './usePowfiSdk'

export interface UnstakeRequest {
  vaultIndex: bigint
  claimableAmount: bigint
  totalAmount: bigint
  startTime: bigint
  duration: bigint
  withdrawnAmount: bigint
  contractAddress: string
}

const useUnstakingRequests = () => {
  const sdk = usePowfiSdk()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const networkId = sdk.network.id

  const { data: activeIndexes, refetch: refetchIndexes } = useQuery({
    queryKey: ['unstakeVaultIndexes', networkId, defaultAddressHash],
    queryFn: () => sdk.staking.getActiveUnstakeVaultIndexes(defaultAddressHash!),
    enabled: !!defaultAddressHash,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const {
    data: unstakeRequests,
    isLoading,
    refetch: refetchRequests
  } = useQuery({
    queryKey: ['unstakeRequests', networkId, defaultAddressHash, activeIndexes?.map((index) => index.toString())],
    queryFn: async () => {
      if (!defaultAddressHash || !activeIndexes?.length) return []

      const results = await Promise.all(
        activeIndexes.map(async (index: bigint) => {
          const [claimableAmount, state] = await Promise.all([
            sdk.staking.getClaimableAmount(defaultAddressHash, index),
            sdk.staking.getAlphUnstakeVaultState(defaultAddressHash, index)
          ])

          return {
            vaultIndex: index,
            claimableAmount,
            totalAmount: state.fields.totalUnstakeAmount,
            startTime: state.fields.unstakeStartTime,
            duration: state.fields.unstakeDuration,
            withdrawnAmount: state.fields.withdrawnAmount,
            contractAddress: state.address
          } as UnstakeRequest
        })
      )

      return results
    },
    enabled: !!defaultAddressHash && !!activeIndexes?.length,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const refresh = async () => {
    await refetchIndexes()
    await refetchRequests()
  }

  return {
    unstakeRequests: unstakeRequests ?? [],
    isLoading,
    refresh
  }
}

export default useUnstakingRequests
