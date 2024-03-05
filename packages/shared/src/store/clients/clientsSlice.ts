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

import { createSlice } from '@reduxjs/toolkit'

import {
  walletConnectClientInitialized,
  walletConnectClientInitializeFailed,
  walletConnectClientInitializing,
  walletConnectClientMaxRetriesReached
} from '@/store/clients/clientsActions'
import { ClientsState } from '@/types/clients'

const initialState: ClientsState = {
  walletConnect: {
    status: 'uninitialized',
    errorMessage: ''
  }
}

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(walletConnectClientInitializing, (state) => {
        state.walletConnect.status = 'initializing'
      })
      .addCase(walletConnectClientInitialized, (state) => {
        state.walletConnect.status = 'initialized'
        state.walletConnect.errorMessage = ''
      })
      .addCase(walletConnectClientInitializeFailed, (state, { payload: errorMessage }) => {
        state.walletConnect.status = 'uninitialized'
        state.walletConnect.errorMessage = errorMessage
      })
      .addCase(walletConnectClientMaxRetriesReached, (state) => {
        state.walletConnect.status = 'initialization-failed'
      })
  }
})

export default clientsSlice
