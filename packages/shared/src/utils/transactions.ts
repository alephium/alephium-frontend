import { explorer as e } from '@alephium/web3'

import {
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isConfirmedTx,
  isConsolidationTx
} from '@/transactions'
import { AddressHash } from '@/types/addresses'
import { TransactionInfoType } from '@/types/transactions'

export const getTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash,
  isInternalTransfer: boolean,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  if (!isConfirmedTx(tx)) {
    return 'pending'
  } else if (isConsolidationTx(tx)) {
    return 'move'
  } else {
    const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

    if (hasPositiveAndNegativeAmounts(alphAmount, tokenAmounts)) {
      return 'swap'
    } else {
      const alphAmountReduced = alphAmount < 0 // tokenAmounts is checked in the swap condition

      if (
        (isInternalTransfer && isInAddressDetailsModal && alphAmountReduced) ||
        (isInternalTransfer && !isInAddressDetailsModal)
      ) {
        return 'move'
      } else {
        if (alphAmountReduced) {
          return 'out'
        } else {
          return 'in'
        }
      }
    }
  }
}
