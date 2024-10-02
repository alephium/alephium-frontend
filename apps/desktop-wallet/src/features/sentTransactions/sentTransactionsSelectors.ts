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

import { AddressHash } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { sentTransactionsAdapter } from '@/features/sentTransactions/sentTransactionsAdapter'
import { RootState } from '@/storage/store'
import { SentTransaction } from '@/types/transactions'

export const { selectAll: selectAllSentTransactions, selectById: selectSentTransactionByHash } =
  sentTransactionsAdapter.getSelectors<RootState>((state) => state.sentTransactions)

export const selectAllPendingSentTransactions = createSelector(selectAllSentTransactions, (sentTransactions) =>
  sentTransactions.filter((tx) => tx.status !== 'confirmed')
)

export const makeSelectAddressPendingSentTransactions = () =>
  createSelector(
    [selectAllPendingSentTransactions, (_, addressHash: AddressHash) => addressHash],
    (sentTransactions, addressHash): SentTransaction[] =>
      sentTransactions.filter((tx) => tx.fromAddress === addressHash || tx.toAddress === addressHash)
  )

export const selectPendingSentTransactionByHash = createSelector(selectSentTransactionByHash, (sentTx) =>
  sentTx?.status !== 'confirmed' ? sentTx : undefined
)
