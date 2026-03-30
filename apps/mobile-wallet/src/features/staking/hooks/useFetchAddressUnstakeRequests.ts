import { selectDefaultAddress } from '@alephium/shared'
import { addressWithoutExplicitGroupIndex } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'

import {
  fetchActiveUnstakeRequestsViaNode,
  fetchClaimableAmountViaNode
} from '~/features/staking/fetchActiveUnstakeRequestsViaNode'
import { useAppSelector } from '~/hooks/redux'

import usePowfiSDK from './usePowfiSDK'

export interface UnstakeRequest {
  vaultIndex: bigint
  claimableAmount: bigint
  totalAmount: bigint
  startTime: bigint
  duration: bigint
  withdrawnAmount: bigint
  contractAddress: string
}

/** Prefix for `useQuery` key; use with `queryClient.invalidateQueries({ queryKey: unstakeVaultRequestsQueryKeyRoot })`. */
export const unstakeVaultRequestsQueryKeyRoot = ['unstakeVaultRequests'] as const

const useFetchAddressUnstakeRequests = () => {
  const { staking, network } = usePowfiSDK()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const nodeHost = useAppSelector((s) => s.network.settings.nodeHost)
  const address = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : undefined
  const networkId = network.id
  const shouldFetch = !!address

  const { data, error, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: [...unstakeVaultRequestsQueryKeyRoot, networkId, nodeHost, address],
    queryFn: async () => {
      const userAddress = address!
      // Temporary: fetch-based XAlph views — replace with `staking.getActiveUnstakeVaultIndexes` / `getClaimableAmount`
      // when the RN Buffer/view stack issue is fixed upstream (see `fetchActiveUnstakeRequestsViaNode` JSDoc).
      const activeIndexes = await fetchActiveUnstakeRequestsViaNode(nodeHost, network.id, userAddress)

      if (!activeIndexes.length) return []

      return Promise.all(
        activeIndexes.map(async (index) => {
          const [claimableAmount, state] = await Promise.all([
            fetchClaimableAmountViaNode(nodeHost, network.id, userAddress, index),
            staking.getAlphUnstakeVaultState(userAddress, index)
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
    refetch,
    refresh: refetch
  }
}

export default useFetchAddressUnstakeRequests
