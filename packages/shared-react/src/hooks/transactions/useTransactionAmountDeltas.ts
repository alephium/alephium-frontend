import { selectPendingSentTransactionByHash } from '@alephium/shared/store'
import { calcTxAmountsDeltaForAddress, isExecuteScriptTx, isSentTx } from '@alephium/shared/transactions'
import { AddressHash, AmountDeltas, ExecuteScriptTx, SentTransaction } from '@alephium/shared/types'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useSharedSelector } from '../../redux'

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
