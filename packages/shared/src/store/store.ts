import { AnyAction, Dispatch, ThunkDispatch } from '@reduxjs/toolkit'

import fungibleTokensSlice from '@/store/assets/fungibleTokensSlice'
import nftsSlice from '@/store/assets/nftsSlice'
import clientsSlice from '@/store/clients/clientsSlice'
import networkSlice from '@/store/network/networkSlice'
import pricesHistorySlice from '@/store/prices/pricesHistorySlice'
import pricesSlice from '@/store/prices/pricesSlice'
import { ClientsState } from '@/types'
import { FungibleTokensState, NFTsState } from '@/types/assets'
import { NetworkState } from '@/types/network'
import { PricesHistoryState, PricesState } from '@/types/price'

export const sharedReducer = {
  [pricesSlice.name]: pricesSlice.reducer,
  [pricesHistorySlice.name]: pricesHistorySlice.reducer,
  [fungibleTokensSlice.name]: fungibleTokensSlice.reducer,
  [nftsSlice.name]: nftsSlice.reducer,
  [networkSlice.name]: networkSlice.reducer,
  [clientsSlice.name]: clientsSlice.reducer
}

// The following 2 types could have been extracted by creating a shared redux store. But since every app defines its own
// store we end up with 2 Redux stores. This can be avoided by defining the 2 types manually.
//
// const sharedStore = configureStore({ reducer: sharedReducer })
// export type SharedRootState = ReturnType<typeof sharedStore.getState>
// export type SharedDispatch = typeof sharedStore.dispatch

export type SharedRootState = {
  [pricesSlice.name]: PricesState
  [pricesHistorySlice.name]: PricesHistoryState
  [fungibleTokensSlice.name]: FungibleTokensState
  [nftsSlice.name]: NFTsState
  [networkSlice.name]: NetworkState
  [clientsSlice.name]: ClientsState
}

export type SharedDispatch = ThunkDispatch<SharedRootState, undefined, AnyAction> & Dispatch<AnyAction>
