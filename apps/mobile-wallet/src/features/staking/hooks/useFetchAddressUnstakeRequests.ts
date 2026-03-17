import { selectDefaultAddress } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '~/hooks/redux'
import { resolveAccountFromAddress, signer } from '~/signer'

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
  const networkId = sdk.network.id
  const shouldFetch = !!defaultAddress

  const {
    data: activeIndexes,
    refetch: refetchIndexes,
    ...activeIndexesQuery
  } = useQuery({
    queryKey: ['unstakeVaultIndexes', networkId, defaultAddress?.hash],
    queryFn: async () => {
      const account = await resolveAccountFromAddress(defaultAddress!, signer.getPublicKey)

      return sdk.staking.getActiveUnstakeVaultIndexes(account.address)
    },
    enabled: shouldFetch,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  const {
    data: unstakeRequests,
    refetch: refetchUnstakeRequests,
    ...unstakeRequestsQuery
  } = useQuery({
    queryKey: ['unstakeRequests', networkId, defaultAddress?.hash, activeIndexes?.map((index) => index.toString())],
    queryFn: async () => {
      if (!defaultAddress || !activeIndexes?.length) return []

      const account = await resolveAccountFromAddress(defaultAddress, signer.getPublicKey)

      return Promise.all(
        activeIndexes.map(async (index) => {
          const [claimableAmount, state] = await Promise.all([
            sdk.staking.getClaimableAmount(account.address, index),
            sdk.staking.getAlphUnstakeVaultState(account.address, index)
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
