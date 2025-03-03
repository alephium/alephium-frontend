import { AddressHash } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import { syncAllAddressesTransactionsNextPage, syncLatestTransactions } from '~/store/addresses/addressesActions'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { RootState } from '~/store/store'
import { walletDeleted } from '~/store/wallet/walletActions'
import { AddressTransactionsSyncResult } from '~/types/addresses'
import { AddressConfirmedTransaction } from '~/types/transactions'
import { selectAddressConfirmedTransactions, selectContactConfirmedTransactions } from '~/utils/addresses'

const sliceName = 'confirmedTransactions'

interface ConfirmedTransactionsState extends EntityState<explorer.Transaction> {
  allLoaded: boolean
  pageLoaded: number
}

const confirmedTransactionsAdapter = createEntityAdapter<explorer.Transaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

const initialState: ConfirmedTransactionsState = confirmedTransactionsAdapter.getInitialState({
  allLoaded: false,
  pageLoaded: 0
})

const confirmedTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncLatestTransactions.fulfilled, (state, { payload }) => {
        const transactions = payload.flatMap(({ newTransactions }) => newTransactions)

        if (transactions && transactions.length > 0) {
          confirmedTransactionsAdapter.upsertMany(state, transactions)
        }
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, action) => {
        const { transactions, pageLoaded } = action.payload

        if (transactions.length > 0) {
          state.pageLoaded = pageLoaded
        } else {
          state.allLoaded = true
        }

        addTransactions(state, action)
      })
      .addCase(walletDeleted, () => initialState)
  }
})

export const { selectAll: selectAllConfirmedTransactions, selectById: selectConfirmedTransactionByHash } =
  confirmedTransactionsAdapter.getSelectors<RootState>((state) => state[sliceName])

export const selectAddressesConfirmedTransactions = createSelector(
  [
    selectAllAddresses,
    selectAllConfirmedTransactions,
    (_, addressHashes?: AddressHash | AddressHash[]) => addressHashes
  ],
  (allAddresses, confirmedTransactions, addressHashes): AddressConfirmedTransaction[] =>
    selectAddressConfirmedTransactions(
      allAddresses,
      confirmedTransactions,
      addressHashes
    ) as AddressConfirmedTransaction[]
)

export const makeSelectContactConfirmedTransactions = () =>
  createSelector(
    [selectAllAddresses, selectAllConfirmedTransactions, (_, contactAddressHash: AddressHash) => contactAddressHash],
    (allAddresses, confirmedTransactions, contactAddressHash): AddressConfirmedTransaction[] =>
      selectContactConfirmedTransactions(
        allAddresses,
        confirmedTransactions,
        contactAddressHash
      ) as AddressConfirmedTransaction[]
  )

export default confirmedTransactionsSlice

// Same as in desktop wallet, move to SDK?
const addTransactions = (
  state: ConfirmedTransactionsState,
  action: PayloadAction<AddressTransactionsSyncResult[] | { transactions: explorer.Transaction[] } | undefined>
) => {
  const transactions = Array.isArray(action.payload)
    ? action.payload.flatMap((address) => address.transactions)
    : action.payload?.transactions

  if (transactions && transactions.length > 0) {
    confirmedTransactionsAdapter.upsertMany(state, transactions)
  }
}
