import { selectDefaultAddress, transactionSent } from '@alephium/shared'
import { addressWithoutExplicitGroupIndex } from '@alephium/web3'
import { useCallback } from 'react'

import { powfiSdk } from '~/api/powfi'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

import useStakingContractConfig from './useStakingContractConfig'
import useStakingQueriesAfterTxConfirmed from './useStakingQueriesAfterTxConfirmed'

const { staking } = powfiSdk

const useAlphStaking = () => {
  const dispatch = useAppDispatch()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const fromAddress = defaultAddress ? addressWithoutExplicitGroupIndex(defaultAddress.hash) : ''
  const refreshStakingData = useStakingQueriesAfterTxConfirmed()
  const { stakingContractAddress, xAlphTokenId } = useStakingContractConfig()

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

  const stakeAlph = useCallback(
    async (amount: bigint) => {
      const result = await staking.stakeAlph(amount)
      sendStakingTx({ txId: result.txId, amount: amount.toString() })
      await refreshStakingData()
      return result
    },
    [refreshStakingData, sendStakingTx]
  )

  const startUnstake = useCallback(
    async (amount: bigint) => {
      const result = await staking.startUnstake(amount)
      sendStakingTx({
        txId: result.txId,
        tokens: xAlphTokenId ? [{ id: xAlphTokenId, amount: amount.toString() }] : undefined
      })
      await refreshStakingData()
      return result
    },
    [refreshStakingData, sendStakingTx, xAlphTokenId]
  )

  const claimUnstaked = useCallback(
    async (vaultIndex: bigint, amount: bigint) => {
      const result = await staking.claimUnstaked(vaultIndex, amount)
      sendStakingTx({ txId: result.txId, amount: amount.toString() })
      await refreshStakingData()
      return result
    },
    [refreshStakingData, sendStakingTx]
  )

  const cancelUnstake = useCallback(
    async (vaultIndex: bigint) => {
      const result = await staking.cancelUnstake(vaultIndex)
      sendStakingTx({ txId: result.txId })
      await refreshStakingData()
      return result
    },
    [refreshStakingData, sendStakingTx]
  )

  return {
    stakeAlph,
    startUnstake,
    claimUnstaked,
    cancelUnstake
  }
}

export default useAlphStaking
