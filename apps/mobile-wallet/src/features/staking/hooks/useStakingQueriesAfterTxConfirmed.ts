import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { unstakeVaultRequestsQueryKeyRoot } from './useFetchAddressUnstakeRequests'
import useFetchXAlphTokenState from './useFetchXAlphTokenState'

const DELAYED_REFETCH_MS = 3000

const invalidateStakingQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  refetchXAlphTokenState: () => Promise<unknown>
) => {
  await Promise.all([
    refetchXAlphTokenState(),
    queryClient.invalidateQueries({ queryKey: [...unstakeVaultRequestsQueryKeyRoot] }),
    queryClient.invalidateQueries({ queryKey: ['address'] })
  ])
}

/**
 * Refetch staking-related queries after a staking tx. Refetches immediately, then again after a short delay to catch
 * on-chain state that may not be indexed yet when the tx is first confirmed.
 */
const useStakingQueriesAfterTxConfirmed = () => {
  const queryClient = useQueryClient()
  const { refetch: refetchXAlphTokenState } = useFetchXAlphTokenState()

  return useCallback(async () => {
    try {
      await invalidateStakingQueries(queryClient, refetchXAlphTokenState)

      setTimeout(() => {
        invalidateStakingQueries(queryClient, refetchXAlphTokenState).catch((error) =>
          console.error('Failed delayed staking data refresh', error)
        )
      }, DELAYED_REFETCH_MS)
    } catch (error) {
      console.error('Failed to refresh staking data', error)
    }
  }, [queryClient, refetchXAlphTokenState])
}

export default useStakingQueriesAfterTxConfirmed
