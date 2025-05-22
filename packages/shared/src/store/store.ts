import { AnyAction, Dispatch, ThunkDispatch } from '@reduxjs/toolkit'

import addressesSlice from '@/store/addresses/addressesSlice'
import clientsSlice from '@/store/clients/clientsSlice'
import hiddenTokensSlice from '@/store/hiddenTokens/hiddenTokensSlice'
import networkSlice from '@/store/network/networkSlice'
import sentTransactionsSlice from '@/store/sentTransactions/sentTransactionsSlice'
import { AddressesState, ClientsState, SentTransactionsState } from '@/types'
import { HiddenTokensState } from '@/types/assets'
import { NetworkState } from '@/types/network'
import { SharedSettings } from '@/types/sharedSettings'

import sharedSettingsSlice from './sharedSettings/sharedSettingsSlice'

export const sharedReducer = {
  [networkSlice.name]: networkSlice.reducer,
  [clientsSlice.name]: clientsSlice.reducer,
  [hiddenTokensSlice.name]: hiddenTokensSlice.reducer,
  [sharedSettingsSlice.name]: sharedSettingsSlice.reducer,
  [addressesSlice.name]: addressesSlice.reducer,
  [sentTransactionsSlice.name]: sentTransactionsSlice.reducer
}

// The following 2 types could have been extracted by creating a shared redux store. But since every app defines its own
// store we end up with 2 Redux stores. This can be avoided by defining the 2 types manually.
//
// const sharedStore = configureStore({ reducer: sharedReducer })
// export type SharedRootState = ReturnType<typeof sharedStore.getState>
// export type SharedDispatch = typeof sharedStore.dispatch

export type SharedRootState = {
  [networkSlice.name]: NetworkState
  [clientsSlice.name]: ClientsState
  [hiddenTokensSlice.name]: HiddenTokensState
  [sharedSettingsSlice.name]: SharedSettings
  [addressesSlice.name]: AddressesState
  [sentTransactionsSlice.name]: SentTransactionsState
}

export type SharedDispatch = ThunkDispatch<SharedRootState, undefined, AnyAction> & Dispatch<AnyAction>
