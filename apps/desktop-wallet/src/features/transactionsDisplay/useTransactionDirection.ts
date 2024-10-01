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
  hasPositiveAndNegativeAmounts,
  isConsolidationTx,
  TransactionDirection
} from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useMemo } from 'react'

import { isPendingTx } from '@/features/transactionsDisplay/transactionDisplayUtils'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { SentTransaction } from '@/types/transactions'

const useTransactionDirection = (tx: Transaction | SentTransaction, addressHash: AddressHash): TransactionDirection => {
  const internalAddresses = useAppSelector(selectAllAddressHashes)

  return useMemo(() => {
    if (isPendingTx(tx)) {
      if (internalAddresses.includes(tx.toAddress)) {
        if (addressHash === tx.fromAddress) {
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
  }, [addressHash, internalAddresses, tx])
}

export default useTransactionDirection
