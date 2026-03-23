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
  const nodeHost = useAppSelector((s) => s.network.settings.nodeHost)
  const address = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : undefined
  const networkId = sdk.network.id
  const shouldFetch = !!address

  const query = useQuery({
    queryKey: ['unstakeVaultRequests', networkId, nodeHost, address],
    queryFn: async () => {
      const userAddress = address!
      const activeIndexes = await sdk.staking.getActiveUnstakeVaultIndexes(userAddress)
      if (!activeIndexes.length) return []

      return Promise.all(
        activeIndexes.map(async (index) => {
          const [claimableAmount, state] = await Promise.all([
            sdk.staking.getClaimableAmount(userAddress, index),
            sdk.staking.getAlphUnstakeVaultState(userAddress, index)
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
    ...query,
    data: query.data ?? [],
    refresh: query.refetch
  }
}

export default useFetchAddressUnstakeRequests
