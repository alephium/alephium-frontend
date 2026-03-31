import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { unstakeVaultRequestsQueryKeyRoot } from './useFetchAddressUnstakeRequests'
import useFetchXAlphTokenState from './useFetchXAlphTokenState'

/**
 * Refetch staking-related queries once a staking (xALPH) contract tx is validated on-chain.
 * Intended for `usePendingTxPolling` `onConfirmed` (not right after sign/submit).
 */
const useStakingQueriesAfterTxConfirmed = () => {
  const queryClient = useQueryClient()
  const { refetch: refetchXAlphTokenState } = useFetchXAlphTokenState()

  return useCallback(async () => {
    try {
      await Promise.all([
        refetchXAlphTokenState(),
        queryClient.invalidateQueries({ queryKey: [...unstakeVaultRequestsQueryKeyRoot] }),
        queryClient.invalidateQueries({ queryKey: ['address'] })
      ])
    } catch (error) {
      console.error('Failed to refresh staking data after tx confirmed', error)
    }
  }, [queryClient, refetchXAlphTokenState])
}

export default useStakingQueriesAfterTxConfirmed
