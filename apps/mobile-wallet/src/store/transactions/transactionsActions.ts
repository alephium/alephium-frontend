import { createAction } from '@reduxjs/toolkit'

import { PendingTransaction } from '~/types/transactions'

export const transactionSent = createAction<PendingTransaction>('transactions/transactionSent')
