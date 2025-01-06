import {
  AddressHash,
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isConfirmedTx,
  isConsolidationTx,
  isInternalTx,
  TransactionInfoType
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

import { store } from '@/storage/store'

export const getTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  const state = store.getState()
  const internalAddresses = state.addresses.ids as AddressHash[]

  if (!isConfirmedTx(tx)) {
    return 'pending'
  } else if (isConsolidationTx(tx)) {
    return 'move'
  } else {
    const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

    if (hasPositiveAndNegativeAmounts(alphAmount, tokenAmounts)) {
      return 'swap'
    } else {
      const isInternalTransfer = isInternalTx(tx, internalAddresses)
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
