import {
  AddressHash,
  AmountDeltas,
  calcTxAmountsDeltaForAddress,
  selectPendingSentTransactionByHash
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useSharedSelector } from '@/redux'

export const useTransactionAmountDeltas = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash
): AmountDeltas => {
  const pendingSentTx = useSharedSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  return useMemo(
    () =>
      pendingSentTx
        ? {
            alphAmount: -BigInt(pendingSentTx.amount ?? 0),
            tokenAmounts: pendingSentTx.tokens?.map(({ id, amount }) => ({ id, amount: -BigInt(amount) })) ?? []
          }
        : calcTxAmountsDeltaForAddress(tx, addressHash),
    [addressHash, tx, pendingSentTx]
  )
}
