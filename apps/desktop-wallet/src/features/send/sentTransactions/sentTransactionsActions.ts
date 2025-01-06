import { createAction } from '@reduxjs/toolkit'

import { SentTransaction } from '@/types/transactions'

export const sentTransactionStatusChanged = createAction<Pick<SentTransaction, 'hash' | 'status'>>(
  'tx/sentTransactionStatusChanged'
)
