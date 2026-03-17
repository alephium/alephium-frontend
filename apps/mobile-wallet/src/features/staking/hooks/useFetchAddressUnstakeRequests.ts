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

const useFetchAddressUnstakeRequests = () => {
  const sdk = usePowfiSdk()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const networkId = sdk.network.id
  const shouldFetch = !!defaultAddressHash

  const {
    data: activeIndexes,
    refetch: refetchIndexes,
    ...activeIndexesQuery
  } = useQuery({
    queryKey: ['unstakeVaultIndexes', networkId, defaultAddressHash],
    queryFn: () => sdk.staking.getActiveUnstakeVaultIndexes(defaultAddressHash!),
    enabled: shouldFetch,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const {
    data: unstakeRequests,
    refetch: refetchUnstakeRequests,
    ...unstakeRequestsQuery
  } = useQuery({
    queryKey: ['unstakeRequests', networkId, defaultAddressHash, activeIndexes?.map((index) => index.toString())],
    queryFn: async () => {
      if (!defaultAddressHash || !activeIndexes?.length) return []

      return Promise.all(
        activeIndexes.map(async (index) => {
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
          } satisfies UnstakeRequest
        })
      )
    },
    enabled: shouldFetch && !!activeIndexes?.length,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const refresh = async () => {
    await Promise.all([refetchIndexes(), refetchUnstakeRequests()])
  }

  return {
    data: unstakeRequests ?? [],
    refresh,
    ...activeIndexesQuery,
    ...unstakeRequestsQuery
  }
}

export default useFetchAddressUnstakeRequests
