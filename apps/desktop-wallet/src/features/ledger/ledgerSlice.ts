import { createSlice } from '@reduxjs/toolkit'

import { newLedgerDeviceConnected, userWasAskedToDiscoverAddresses } from './ledgerActions'

interface LedgerState {
  isNewDevice: boolean
}

const initialState: LedgerState = {
  isNewDevice: false
}

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(newLedgerDeviceConnected, (state) => {
        state.isNewDevice = true
      })
      .addCase(userWasAskedToDiscoverAddresses, (state) => {
        state.isNewDevice = false
      })
  }
})

export default ledgerSlice
