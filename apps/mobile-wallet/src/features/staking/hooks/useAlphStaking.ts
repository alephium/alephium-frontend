import { selectDefaultAddressHash, signAndSubmitTxResultToSentTx, transactionSent } from '@alephium/shared'
import { SignExecuteScriptTxParams, SignExecuteScriptTxResult, Token } from '@alephium/web3'
import { useCallback } from 'react'

import { powfiSdk, xAlphTokenId } from '~/api/powfi'
import {
  stakeOrUnstakeCompleted,
  stakeOrUnstakeStarted,
  vaultActionCompleted,
  vaultActionStarted
} from '~/features/staking/stakingSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

type RecordTxAndRefreshProps = {
  result: SignExecuteScriptTxResult
  alphAmount?: SignExecuteScriptTxParams['attoAlphAmount']
  xAlphAmount?: Token['amount']
}

const useAlphStaking = () => {
  const dispatch = useAppDispatch()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  const recordTx = useCallback(
    async ({ result, alphAmount, xAlphAmount }: RecordTxAndRefreshProps) => {
      if (!defaultAddressHash) throw Error('Default address hash not found')

      const sentTx = signAndSubmitTxResultToSentTx({
        type: 'EXECUTE_SCRIPT',
        txParams: {
          signerAddress: defaultAddressHash,
          attoAlphAmount: alphAmount,
          tokens: xAlphAmount ? [{ id: xAlphTokenId, amount: xAlphAmount }] : undefined,
          bytecode: ''
        },
        result
      })
      dispatch(transactionSent(sentTx))
    },
    [dispatch, defaultAddressHash]
  )

  const stakeAlph = useCallback(
    async (amount: bigint) => {
      try {
        const result = await powfiSdk.staking.stakeAlph(amount)
        dispatch(stakeOrUnstakeStarted({ type: 'stake', txHash: result.txId }))
        recordTx({ result, alphAmount: amount })
        return result
      } catch (error) {
        dispatch(stakeOrUnstakeCompleted())
        throw error
      }
    },
    [dispatch, recordTx]
  )

  const startUnstake = useCallback(
    async (amount: bigint) => {
      try {
        const result = await powfiSdk.staking.startUnstake(amount)
        dispatch(stakeOrUnstakeStarted({ type: 'unstake', txHash: result.txId }))
        await recordTx({ result, xAlphAmount: amount })
        return result
      } catch (error) {
        dispatch(stakeOrUnstakeCompleted())
        throw error
      }
    },
    [dispatch, recordTx]
  )

  const claimUnstaked = useCallback(
    async (vaultIndex: bigint, amount: bigint) => {
      try {
        const result = await powfiSdk.staking.claimUnstaked(vaultIndex, amount)
        dispatch(vaultActionStarted({ vaultIndex: vaultIndex.toString(), type: 'claim', txHash: result.txId }))
        await recordTx({ result, alphAmount: amount })
        return result
      } catch (error) {
        dispatch(vaultActionCompleted(vaultIndex.toString()))
        throw error
      }
    },
    [dispatch, recordTx]
  )

  const cancelUnstake = useCallback(
    async (vaultIndex: bigint) => {
      try {
        const result = await powfiSdk.staking.cancelUnstake(vaultIndex)
        dispatch(vaultActionStarted({ vaultIndex: vaultIndex.toString(), type: 'cancel', txHash: result.txId }))
        await recordTx({ result })
        return result
      } catch (error) {
        dispatch(vaultActionCompleted(vaultIndex.toString()))
        throw error
      }
    },
    [dispatch, recordTx]
  )

  return {
    stakeAlph,
    startUnstake,
    claimUnstaked,
    cancelUnstake
  }
}

export default useAlphStaking
