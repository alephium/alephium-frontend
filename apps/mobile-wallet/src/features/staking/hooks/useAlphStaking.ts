import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import usePowfiSdk from './usePowfiSdk'
import useStakingData from './useStakingData'
import useUnstakingRequests from './useUnstakingRequests'

const useAlphStaking = () => {
  const sdk = usePowfiSdk()
  const { refresh: refreshStakingData } = useStakingData()
  const { refresh: refreshUnstakingRequests } = useUnstakingRequests()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refreshStakingData(),
        refreshUnstakingRequests(),
        queryClient.invalidateQueries({ queryKey: ['address'] })
      ])
    } catch (error) {
      console.error('Failed to refresh staking data', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [queryClient, refreshStakingData, refreshUnstakingRequests])

  const stakeAlph = useCallback(
    async (amount: bigint) => {
      const result = await sdk.staking.stakeAlph(amount)
      await refreshAll()
      return result
    },
    [sdk, refreshAll]
  )

  const startUnstake = useCallback(
    async (amount: bigint) => {
      const result = await sdk.staking.startUnstake(amount)
      await refreshAll()
      return result
    },
    [sdk, refreshAll]
  )

  const claimUnstaked = useCallback(
    async (vaultIndex: bigint, amount: bigint) => {
      const result = await sdk.staking.claimUnstaked(vaultIndex, amount)
      await refreshAll()
      return result
    },
    [sdk, refreshAll]
  )

  const cancelUnstake = useCallback(
    async (vaultIndex: bigint) => {
      const result = await sdk.staking.cancelUnstake(vaultIndex)
      await refreshAll()
      return result
    },
    [sdk, refreshAll]
  )

  return {
    stakeAlph,
    startUnstake,
    claimUnstaked,
    cancelUnstake,
    isRefreshing,
    refreshAll
  }
}

export default useAlphStaking
