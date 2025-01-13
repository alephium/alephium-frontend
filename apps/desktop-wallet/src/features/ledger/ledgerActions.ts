import { createAction } from '@reduxjs/toolkit'

export const newLedgerDeviceConnected = createAction('ledger/newLedgerDeviceConnected')

export const userWasAskedToDiscoverAddresses = createAction('ledger/userWasAskedToDiscoverAddresses')
