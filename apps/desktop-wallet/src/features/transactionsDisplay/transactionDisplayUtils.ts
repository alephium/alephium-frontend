/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import {
  AddressHash,
  calcTxAmountsDeltaForAddress,
  convertToNegative,
  hasPositiveAndNegativeAmounts,
  isConsolidationTx,
  isInternalTx,
  TransactionInfoType
} from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'

import { store } from '@/storage/store'
import { PendingTransaction } from '@/types/transactions'

export const isPendingTx = (tx: Transaction | PendingTransaction): tx is PendingTransaction =>
  (tx as PendingTransaction).status === 'pending'

export const getTransactionInfoType = (
  tx: Transaction | PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  const state = store.getState()
  const internalAddresses = state.addresses.ids as AddressHash[]

  if (isPendingTx(tx)) {
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

export const getTransactionAmountDeltas = (tx: Transaction | PendingTransaction, addressHash: AddressHash) =>
  isPendingTx(tx) ? calcPendingTxAmountsDelta(tx) : calcTxAmountsDeltaForAddress(tx, addressHash)

const calcPendingTxAmountsDelta = (tx: PendingTransaction) => ({
  alphAmount: tx.amount ? convertToNegative(BigInt(tx.amount)) : BigInt(0),
  tokenAmounts: tx.tokens
    ? tx.tokens.map((token) => ({ ...token, amount: convertToNegative(BigInt(token.amount)) }))
    : []
})
