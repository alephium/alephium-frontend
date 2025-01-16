import { AddressHash, AmountDeltas, calcTxAmountsDeltaForAddress } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { selectPendingSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import { useAppSelector } from '@/hooks/redux'

const useTransactionAmountDeltas = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash
): AmountDeltas => {
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

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

export default useTransactionAmountDeltas
