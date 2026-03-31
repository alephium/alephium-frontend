import { selectDefaultAddress, transactionSent } from '@alephium/shared'
import { addressWithoutExplicitGroupIndex } from '@alephium/web3'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'

import useFetchXAlphTokenState from './useFetchXAlphTokenState'
import usePowfiSDK from './usePowfiSDK'
import useStakingContractConfig from './useStakingContractConfig'

const useAlphStaking = () => {
  const { staking } = usePowfiSDK()
  const dispatch = useAppDispatch()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const fromAddress = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : ''
  const { refetch: refetchXAlphTokenState } = useFetchXAlphTokenState()
  const queryClient = useQueryClient()
  const { xAlphTokenAddress: stakingContractAddress, xAlphTokenId } = useStakingContractConfig()

  const sendStakingTx = useCallback(
    ({ txId, amount, tokens }: { txId: string; amount?: string; tokens?: Array<{ id: string; amount: string }> }) => {
      if (!fromAddress) return

      dispatch(
        transactionSent({
          hash: txId,
          fromAddress,
          toAddress: stakingContractAddress,
          amount,
          tokens,
          timestamp: Date.now(),
          status: 'sent',
          type: 'contract'
        })
      )
    },
    [dispatch, fromAddress, stakingContractAddress]
  )

  /** Runs after submit; unstake list refreshes on-chain via `usePendingTxPolling` + `useStakingQueriesAfterTxConfirmed`. */
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([refetchXAlphTokenState(), queryClient.invalidateQueries({ queryKey: ['address'] })])
    } catch (error) {
      console.error('Failed to refresh staking data', error)
    }
  }, [queryClient, refetchXAlphTokenState])

  const stakeAlph = useCallback(
    async (amount: bigint) => {
      const result = await staking.stakeAlph(amount)
      sendStakingTx({ txId: result.txId, amount: amount.toString() })
      await refreshAll()
      return result
    },
    [staking, refreshAll, sendStakingTx]
  )

  const startUnstake = useCallback(
    async (amount: bigint) => {
      const result = await staking.startUnstake(amount)
      sendStakingTx({
        txId: result.txId,
        tokens: xAlphTokenId ? [{ id: xAlphTokenId, amount: amount.toString() }] : undefined
      })
      await refreshAll()
      return result
    },
    [staking, refreshAll, sendStakingTx, xAlphTokenId]
  )

  const claimUnstaked = useCallback(
    async (vaultIndex: bigint, amount: bigint) => {
      const result = await staking.claimUnstaked(vaultIndex, amount)
      sendStakingTx({ txId: result.txId, amount: amount.toString() })
      await refreshAll()
      return result
    },
    [staking, refreshAll, sendStakingTx]
  )

  const cancelUnstake = useCallback(
    async (vaultIndex: bigint) => {
      const result = await staking.cancelUnstake(vaultIndex)
      sendStakingTx({ txId: result.txId })
      await refreshAll()
      return result
    },
    [staking, refreshAll, sendStakingTx]
  )

  return {
    stakeAlph,
    startUnstake,
    claimUnstaked,
    cancelUnstake
  }
}

export default useAlphStaking
