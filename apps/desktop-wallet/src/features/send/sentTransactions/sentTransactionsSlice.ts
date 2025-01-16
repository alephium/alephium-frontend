import { createSlice, EntityState, isAnyOf } from '@reduxjs/toolkit'

import { sentTransactionStatusChanged } from '@/features/send/sentTransactions/sentTransactionsActions'
import { sentTransactionsAdapter } from '@/features/send/sentTransactions/sentTransactionsAdapter'
import { receiveFaucetTokens } from '@/storage/global/globalActions'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/wallets/walletActions'
import { SentTransaction } from '@/types/transactions'

type SentTransactionsState = EntityState<SentTransaction>

const initialState: SentTransactionsState = sentTransactionsAdapter.getInitialState()

const sentTransactionsSlice = createSlice({
  name: 'sentTransactions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(transactionSent, sentTransactionsAdapter.addOne)
      .addCase(receiveFaucetTokens.fulfilled, sentTransactionsAdapter.addOne)
      .addCase(sentTransactionStatusChanged, (state, { payload: { hash, status } }) => {
        sentTransactionsAdapter.updateOne(state, { id: hash, changes: { status } })
      })

    builder.addMatcher(isAnyOf(walletLocked, walletSwitched, activeWalletDeleted), () => initialState)
  }
})

export default sentTransactionsSlice
