import { createSelector } from '@reduxjs/toolkit'

import { sentTransactionsAdapter } from '@/store/sentTransactions/sentTransactionsAdapter'
import { SharedRootState } from '@/store/store'
import { AddressHash } from '@/types/addresses'
import { SentTransaction } from '@/types/transactions'

export const { selectAll: selectAllSentTransactions, selectById: selectSentTransactionByHash } =
  sentTransactionsAdapter.getSelectors<SharedRootState>((state) => state.sentTransactions)

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
