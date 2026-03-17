import { transactionSent } from '@alephium/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useAppDispatch } from '~/hooks/redux'

import useFetchAddressUnstakeRequests from './useFetchAddressUnstakeRequests'
import useFetchXAlphTokenState from './useFetchXAlphTokenState'
import usePowfiSdk from './usePowfiSdk'
import useXAlphTokenId from './useXAlphTokenId'

const useAlphStaking = () => {
  const sdk = usePowfiSdk()
  const dispatch = useAppDispatch()
  const { refetch: refetchXAlphTokenState } = useFetchXAlphTokenState()
  const { refresh: refreshUnstakeRequests } = useFetchAddressUnstakeRequests()
  const queryClient = useQueryClient()
  const xAlphTokenId = useXAlphTokenId()
  const stakingContractAddress = useMemo(() => {
    try {
      return sdk.staking.getConfig().xAlphTokenAddress
    } catch {
      return ''
    }
  }, [sdk])

  const trackSentTransaction = useCallback(
    ({ txId, amount, tokens }: { txId: string; amount?: string; tokens?: Array<{ id: string; amount: string }> }) => {
      dispatch(
        transactionSent({
          hash: txId,
          fromAddress: sdk.account.address,
          toAddress: stakingContractAddress,
          amount,
          tokens,
          timestamp: Date.now(),
          status: 'sent',
          type: 'contract'
        })
      )
    },
    [dispatch, sdk, stakingContractAddress]
  )

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refetchXAlphTokenState(),
        refreshUnstakeRequests(),
        queryClient.invalidateQueries({ queryKey: ['address'] })
      ])
    } catch (error) {
      console.error('Failed to refresh staking data', error)
    }
  }, [queryClient, refetchXAlphTokenState, refreshUnstakeRequests])

  const stakeAlph = useCallback(
    async (amount: bigint) => {
      const result = await sdk.staking.stakeAlph(amount)
      trackSentTransaction({ txId: result.txId, amount: amount.toString() })
      await refreshAll()
      return result
    },
    [sdk, refreshAll, trackSentTransaction]
  )

  const startUnstake = useCallback(
    async (amount: bigint) => {
      const result = await sdk.staking.startUnstake(amount)
      trackSentTransaction({
        txId: result.txId,
        tokens: xAlphTokenId ? [{ id: xAlphTokenId, amount: amount.toString() }] : undefined
      })
      await refreshAll()
      return result
    },
    [sdk, refreshAll, trackSentTransaction, xAlphTokenId]
  )

  const claimUnstaked = useCallback(
    async (vaultIndex: bigint, amount: bigint) => {
      const result = await sdk.staking.claimUnstaked(vaultIndex, amount)
      trackSentTransaction({ txId: result.txId, amount: amount.toString() })
      await refreshAll()
      return result
    },
    [sdk, refreshAll, trackSentTransaction]
  )

  const cancelUnstake = useCallback(
    async (vaultIndex: bigint) => {
      const result = await sdk.staking.cancelUnstake(vaultIndex)
      trackSentTransaction({ txId: result.txId })
      await refreshAll()
      return result
    },
    [sdk, refreshAll, trackSentTransaction]
  )

  return {
    stakeAlph,
    startUnstake,
    claimUnstaked,
    cancelUnstake
  }
}

export default useAlphStaking
