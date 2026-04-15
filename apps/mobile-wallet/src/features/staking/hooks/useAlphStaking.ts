import { selectDefaultAddressHash, signAndSubmitTxResultToSentTx, transactionSent } from '@alephium/shared'
import { SignExecuteScriptTxParams, SignExecuteScriptTxResult, Token } from '@alephium/web3'
import { useCallback } from 'react'

import { powfiSdk } from '~/api/powfi'
import { setIsCanceling, setIsClaiming, setIsStaking, setIsUnstaking } from '~/features/staking/stakingSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

import useStakingContractConfig from './useStakingContractConfig'

type RecordTxAndRefreshProps = {
  result: SignExecuteScriptTxResult
  alphAmount?: SignExecuteScriptTxParams['attoAlphAmount']
  xAlphAmount?: Token['amount']
}

const useAlphStaking = () => {
  const dispatch = useAppDispatch()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const { xAlphTokenId } = useStakingContractConfig()

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
    [dispatch, defaultAddressHash, xAlphTokenId]
  )

  const stakeAlph = useCallback(
    async (amount: bigint) => {
      dispatch(setIsStaking(true))
      try {
        const result = await powfiSdk.staking.stakeAlph(amount)
        recordTx({ result, alphAmount: amount })
        return result
      } catch (error) {
        dispatch(setIsStaking(false))
        throw error
      }
    },
    [dispatch, recordTx]
  )

  const startUnstake = useCallback(
    async (amount: bigint) => {
      dispatch(setIsUnstaking(true))
      try {
        const result = await powfiSdk.staking.startUnstake(amount)
        await recordTx({ result, xAlphAmount: amount })
        return result
      } catch (error) {
        dispatch(setIsUnstaking(false))
        throw error
      }
    },
    [dispatch, recordTx]
  )

  const claimUnstaked = useCallback(
    async (vaultIndex: bigint, amount: bigint) => {
      dispatch(setIsClaiming(true))
      try {
        const result = await powfiSdk.staking.claimUnstaked(vaultIndex, amount)
        await recordTx({ result, alphAmount: amount })
        return result
      } catch (error) {
        dispatch(setIsClaiming(false))
        throw error
      }
    },
    [dispatch, recordTx]
  )

  const cancelUnstake = useCallback(
    async (vaultIndex: bigint) => {
      dispatch(setIsCanceling(true))
      try {
        const result = await powfiSdk.staking.cancelUnstake(vaultIndex)
        await recordTx({ result })
        return result
      } catch (error) {
        dispatch(setIsCanceling(false))
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
