import { explorer as e } from '@alephium/web3'

import {
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isConfirmedTx,
  isConsolidationTx,
  isInternalTx
} from '@/transactions'
import { AddressHash } from '@/types/addresses'
import { AssetAmount, TokenApiBalances } from '@/types/assets'
import { SentTransaction, TransactionInfoType } from '@/types/transactions'

export const getTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  addressHash: AddressHash,
  internalAddresses: AddressHash[],
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
      const isInternalTransfer = isInternalTx(tx, internalAddresses)

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

export const shouldBuildSweepTransactions = (assetAmounts: AssetAmount[], tokensBalances: TokenApiBalances[]) =>
  assetAmounts.length === tokensBalances.length &&
  tokensBalances.every(({ id, totalBalance }) => {
    const assetAmount = assetAmounts.find((asset) => asset.id === id)

    return totalBalance === (assetAmount?.amount ?? 0).toString()
  })
