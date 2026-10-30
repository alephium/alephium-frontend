import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { powfiSdk } from '~/api/powfi'
import { PersistedBigInts } from '~/features/staking/stakingUtils'

export interface UnstakeRequest {
  vaultIndex: bigint
  claimableAmount: bigint
  totalAmount: bigint
  startTime: bigint
  duration: bigint
  withdrawnAmount: bigint
  contractAddress: string
}

type PersistedUnstakeRequest = PersistedBigInts<UnstakeRequest>

export const unstakeVaultRequestsQueryKeyRoot = ['unstakeVaultRequests'] as const

interface UseFetchAddressUnstakeRequestsProps {
  addressHash: AddressHash
}

const useFetchAddressUnstakeRequests = ({ addressHash }: UseFetchAddressUnstakeRequestsProps) => {
  const { data, error, isError, isLoading, isRefetching, refetch } = useQuery<
    PersistedUnstakeRequest[],
    Error,
    UnstakeRequest[]
  >({
    queryKey: [...unstakeVaultRequestsQueryKeyRoot, powfiSdk.network.id, addressHash],
    queryFn: async () => {
      const activeIndexes = await powfiSdk.staking.getActiveUnstakeVaultIndexes(addressHash)

      if (!activeIndexes.length) return []

      return Promise.all(
        activeIndexes.map(async (index) => {
          const [claimableAmount, state] = await Promise.all([
            powfiSdk.staking.getClaimableAmount(addressHash, index),
            powfiSdk.staking.getAlphUnstakeVaultState(addressHash, index)
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
    select: toUnstakeRequests,
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

const toUnstakeRequests = (requests: PersistedUnstakeRequest[]) => requests.map(toUnstakeRequest)

const toUnstakeRequest = (request: PersistedUnstakeRequest): UnstakeRequest => ({
  ...request,
  vaultIndex: BigInt(request.vaultIndex),
  claimableAmount: BigInt(request.claimableAmount),
  totalAmount: BigInt(request.totalAmount),
  startTime: BigInt(request.startTime),
  duration: BigInt(request.duration),
  withdrawnAmount: BigInt(request.withdrawnAmount)
})
