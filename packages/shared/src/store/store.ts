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

import { AnyAction, Dispatch, ThunkDispatch } from '@reduxjs/toolkit'

import clientsSlice from '@/store/clients/clientsSlice'
import networkSlice from '@/store/network/networkSlice'
import pricesHistorySlice from '@/store/prices/pricesHistorySlice'
import pricesSlice from '@/store/prices/pricesSlice'
import { ClientsState } from '@/types'
import { NetworkState } from '@/types/network'
import { PricesHistoryState, PricesState } from '@/types/price'
import { baseApi } from '@/api/baseApi'

export const sharedReducer = {
  [pricesSlice.name]: pricesSlice.reducer,
  [pricesHistorySlice.name]: pricesHistorySlice.reducer,
  [networkSlice.name]: networkSlice.reducer,
  [clientsSlice.name]: clientsSlice.reducer,
  [baseApi.reducerPath]: baseApi.reducer
}

export const sharedMiddleware = [baseApi.middleware]

// The following 2 types could have been extracted by creating a shared redux store. But since every app defines its own
// store we end up with 2 Redux stores. This can be avoided by defining the 2 types manually.
//
// const sharedStore = configureStore({ reducer: sharedReducer })
// export type SharedRootState = ReturnType<typeof sharedStore.getState>
// export type SharedDispatch = typeof sharedStore.dispatch

export type SharedRootState = {
  [pricesSlice.name]: PricesState
  [pricesHistorySlice.name]: PricesHistoryState
  [networkSlice.name]: NetworkState
  [clientsSlice.name]: ClientsState
}

export type SharedDispatch = ThunkDispatch<SharedRootState, undefined, AnyAction> & Dispatch<AnyAction>
