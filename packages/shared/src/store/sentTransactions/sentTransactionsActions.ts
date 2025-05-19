import { createAction } from '@reduxjs/toolkit'

import { SentTransaction } from '@/types/transactions'

export const sentTransactionStatusChanged = createAction<Pick<SentTransaction, 'hash' | 'status'>>(
  'tx/sentTransactionStatusChanged'
)

export const removeSentTransaction = createAction<SentTransaction['hash']>('tx/removeSentTransaction')

export const transactionSent = createAction<SentTransaction>('tx/transactionSent')
