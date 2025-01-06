import { createAction } from '@reduxjs/toolkit'

import { WalletConnectErrorMessage } from '@/types/clients'

export const walletConnectClientInitialized = createAction('clients/walletConnectClientInitialized')
export const walletConnectClientInitializing = createAction('clients/walletConnectClientInitializing')
export const walletConnectClientInitializeFailed = createAction<WalletConnectErrorMessage>(
  'clients/walletConnectClientInitializeFailed'
)
export const walletConnectClientMaxRetriesReached = createAction('clients/walletConnectClientMaxRetriesReached')
