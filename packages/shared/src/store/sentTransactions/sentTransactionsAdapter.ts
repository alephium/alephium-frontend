import { createEntityAdapter } from '@reduxjs/toolkit'

import { SentTransaction } from '@/types/transactions'

export const sentTransactionsAdapter = createEntityAdapter<SentTransaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})
