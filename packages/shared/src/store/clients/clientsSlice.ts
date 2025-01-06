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
