import { selectSentTransactionByHash } from '@alephium/shared/store'
import { isConfirmedTx } from '@alephium/shared/transactions'
import { useFetchTransaction, usePendingTxPolling } from '@alephium/shared-react'

import { useAppSelector } from '~/hooks/redux'

export type SwapConfirmationStatus = 'pending' | 'confirmed' | 'reverted'

// Once minted, a swap either succeeded or its script reverted - a confirmed tx, gas burnt, funds
// returned, but the swap did NOT happen (e.g. the price moved past slippage). The sent-tx store only
// tracks sent|mempooled|confirmed, so we read the confirmed tx's scriptExecutionOk to tell the two
// apart. A not-yet-minted tx stays 'pending': there is no on-chain signal for when (or whether) it
// will land, and it stays tracked in the activity feed regardless.
const useSwapConfirmation = (txHash: string | undefined): SwapConfirmationStatus => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash ?? ''))

  usePendingTxPolling(txHash ?? '')

  const isMinted = sentTx?.status === 'confirmed'
  const { data: tx } = useFetchTransaction({ txHash: txHash ?? '', skip: !txHash || !isMinted })

  if (tx && isConfirmedTx(tx)) return tx.scriptExecutionOk === false ? 'reverted' : 'confirmed'

  return 'pending'
}

export default useSwapConfirmation
