import {
  AddressHash,
  AmountDeltas,
  calcTxAmountsDeltaForAddress,
  isSentTx,
  selectPendingSentTransactionByHash,
  SentTransaction
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useSharedSelector } from '@/redux'

export const useTransactionAmountDeltas = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  addressHash: AddressHash
): AmountDeltas => {
  const pendingSentTx = useSharedSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

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
  tokenAmounts: tx.tokens?.map(({ id, amount }) => ({ id, amount: -BigInt(amount) })) ?? []
})
