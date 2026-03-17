import { selectDefaultAddress } from '@alephium/shared'
import { addressWithoutExplicitGroupIndex } from '@alephium/web3'
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
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const address = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : undefined
  const networkId = sdk.network.id
  const shouldFetch = !!address

  const {
    data: activeIndexes,
    refetch: refetchIndexes,
    ...activeIndexesQuery
  } = useQuery({
    queryKey: ['unstakeVaultIndexes', networkId, address],
    queryFn: () => sdk.staking.getActiveUnstakeVaultIndexes(address!),
    enabled: shouldFetch,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const {
    data: unstakeRequests,
    refetch: refetchUnstakeRequests,
    ...unstakeRequestsQuery
  } = useQuery({
    queryKey: ['unstakeRequests', networkId, address, activeIndexes?.map((index) => index.toString())],
    queryFn: async () => {
      if (!address || !activeIndexes?.length) return []

      return Promise.all(
        activeIndexes.map(async (index) => {
          const [claimableAmount, state] = await Promise.all([
            sdk.staking.getClaimableAmount(address, index),
            sdk.staking.getAlphUnstakeVaultState(address, index)
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
    ...activeIndexesQuery,
    ...unstakeRequestsQuery,
    data: unstakeRequests ?? [],
    isLoading: activeIndexesQuery.isLoading || unstakeRequestsQuery.isLoading,
    isFetching: activeIndexesQuery.isFetching || unstakeRequestsQuery.isFetching,
    refresh
  }
}

export default useFetchAddressUnstakeRequests
