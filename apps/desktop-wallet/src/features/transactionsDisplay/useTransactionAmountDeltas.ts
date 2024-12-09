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
