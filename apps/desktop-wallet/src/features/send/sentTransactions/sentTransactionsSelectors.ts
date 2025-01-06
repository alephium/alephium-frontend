import { AddressHash } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { sentTransactionsAdapter } from '@/features/send/sentTransactions/sentTransactionsAdapter'
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
