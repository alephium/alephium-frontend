import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  removeSentTransaction,
  sentTransactionStatusChanged,
  transactionSent
} from '@/store/sentTransactions/sentTransactionsActions'
import { sentTransactionsAdapter } from '@/store/sentTransactions/sentTransactionsAdapter'
import { activeWalletDeleted, walletLocked } from '@/store/wallets/walletActions'
import { walletSwitchedDesktop, walletUnlockedDesktop } from '@/store/wallets/walletActionsDesktop'
import { SentTransactionsState } from '@/types/transactions'

const initialState: SentTransactionsState = sentTransactionsAdapter.getInitialState()

const sentTransactionsSlice = createSlice({
  name: 'sentTransactions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(transactionSent, sentTransactionsAdapter.addOne)
      .addCase(sentTransactionStatusChanged, (state, { payload: { hash, status } }) => {
        sentTransactionsAdapter.updateOne(state, { id: hash, changes: { status } })
      })
      .addCase(removeSentTransaction, (state, { payload: hash }) => {
        sentTransactionsAdapter.removeOne(state, hash)
      })

    builder.addMatcher(
      isAnyOf(walletLocked, walletUnlockedDesktop, walletSwitchedDesktop, activeWalletDeleted),
      () => initialState
    )
  }
})

export default sentTransactionsSlice
