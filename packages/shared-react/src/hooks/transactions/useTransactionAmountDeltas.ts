import {
  AddressHash,
  AmountDeltas,
  calcTxAmountsDeltaForAddress,
  ExecuteScriptTx,
  isExecuteScriptTx,
  isSentTx,
  selectPendingSentTransactionByHash,
  SentTransaction
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useSharedSelector } from '@/redux'

export const useTransactionAmountDeltas = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction | ExecuteScriptTx,
  addressHash: AddressHash
): AmountDeltas => {
  const txHash = isExecuteScriptTx(tx) ? tx.txId : tx.hash
  const pendingSentTx = useSharedSelector((s) => selectPendingSentTransactionByHash(s, txHash))

  return useMemo(
    () =>
      isSentTx(tx)
        ? calculatePendingTxAmountsDeltas(tx)
        : pendingSentTx
          ? calculatePendingTxAmountsDeltas(pendingSentTx)
          : calcTxAmountsDeltaForAddress(tx, addressHash),
    [addressHash, tx, pendingSentTx]
  )
}

const calculatePendingTxAmountsDeltas = (tx: SentTransaction) => ({
  alphAmount: -BigInt(tx.amount ?? 0),
  tokenAmounts: tx.tokens?.map(({ id, amount }) => ({ id, amount: -BigInt(amount) })) ?? [],
  fee: BigInt(0)
})
