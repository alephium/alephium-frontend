import { sharedReducer } from '@alephium/shared'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

import hiddenTokensListenerMiddleware from '@/features/hiddenTokens/hiddenTokensMiddleware'
import ledgerSlice from '@/features/ledger/ledgerSlice'
import modalSlice from '@/features/modals/modalSlice'
import settingsSlice, { settingsListenerMiddleware } from '@/features/settings/settingsSlice'
import toastMessagesSlice from '@/features/toastMessages/toastMessagesSlice'
import contactsSlice from '@/storage/addresses/contactsSlice'
import globalSlice from '@/storage/global/globalSlice'
import { networkListenerMiddleware } from '@/storage/network/networkMiddleware'
import activeWalletSlice from '@/storage/wallets/activeWalletSlice'

export const store = configureStore({
  reducer: {
    ...sharedReducer,
    [globalSlice.name]: globalSlice.reducer,
    [activeWalletSlice.name]: activeWalletSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [toastMessagesSlice.name]: toastMessagesSlice.reducer,
    [modalSlice.name]: modalSlice.reducer,
    [ledgerSlice.name]: ledgerSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // The modal system might need functions to be passed as props and functions are not serializable
        ignoredPaths: ['modals'],
        ignoredActions: ['modal/openModal']
      }
    })
      .concat(settingsListenerMiddleware.middleware)
      .concat(networkListenerMiddleware.middleware)
      .concat(hiddenTokensListenerMiddleware.middleware)
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
