import {
  AddressHash,
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isConsolidationTx,
  selectPendingSentTransactionByHash,
  TransactionDirection
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useSharedSelector } from '@/redux'

export const useTransactionDirection = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash
): TransactionDirection => {
  const internalAddresses = useUnsortedAddressesHashes()
  const pendingSentTx = useSharedSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  return useMemo(() => {
    if (pendingSentTx) {
      if (internalAddresses.includes(pendingSentTx.toAddress)) {
        if (addressHash === pendingSentTx.fromAddress) {
          return 'out'
        } else {
          return 'in'
        }
      } else {
        return 'out'
      }
    } else if (isConsolidationTx(tx)) {
      return 'out'
    } else {
      const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

      if (hasPositiveAndNegativeAmounts(alphAmount, tokenAmounts)) {
        return 'swap'
      } else {
        // tokenAmounts is checked in the swap condition
        if (alphAmount < 0) {
          return 'out'
        } else {
          return 'in'
        }
      }
    }
  }, [addressHash, internalAddresses, pendingSentTx, tx])
}
