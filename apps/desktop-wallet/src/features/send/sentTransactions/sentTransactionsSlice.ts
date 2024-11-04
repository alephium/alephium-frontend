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
