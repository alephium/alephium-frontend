import { createSelector } from '@reduxjs/toolkit'

import { sentTransactionsAdapter } from '@/store/sentTransactions/sentTransactionsAdapter'
import { SharedRootState } from '@/store/store'

export const { selectAll: selectAllSentTransactions, selectById: selectSentTransactionByHash } =
  sentTransactionsAdapter.getSelectors<SharedRootState>((state) => state.sentTransactions)

export const selectAllPendingSentTransactions = createSelector(selectAllSentTransactions, (sentTransactions) =>
  sentTransactions.filter((tx) => tx.status !== 'confirmed')
)

export const selectPendingSentTransactionByHash = createSelector(selectSentTransactionByHash, (sentTx) =>
  sentTx?.status !== 'confirmed' ? sentTx : undefined
)
