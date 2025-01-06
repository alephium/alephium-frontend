import { sharedReducer } from '@alephium/shared'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

import historicWorthChartSlice from '@/features/historicChart/historicWorthChartSlice'
import modalSlice from '@/features/modals/modalSlice'
import sentTransactionsSlice from '@/features/send/sentTransactions/sentTransactionsSlice'
import settingsSlice, { settingsListenerMiddleware } from '@/features/settings/settingsSlice'
import addressesSlice from '@/storage/addresses/addressesSlice'
import contactsSlice from '@/storage/addresses/contactsSlice'
import globalSlice from '@/storage/global/globalSlice'
import snackbarSlice from '@/storage/global/snackbarSlice'
import { networkListenerMiddleware } from '@/storage/network/networkMiddleware'
import activeWalletSlice from '@/storage/wallets/activeWalletSlice'

// TODO: Remove deconstruction when API related slices are removed from the shared reducer
const { network, clients } = sharedReducer

export const store = configureStore({
  reducer: {
    network,
    clients,
    [globalSlice.name]: globalSlice.reducer,
    [activeWalletSlice.name]: activeWalletSlice.reducer,
    [contactsSlice.name]: contactsSlice.reducer,
    [settingsSlice.name]: settingsSlice.reducer,
    [addressesSlice.name]: addressesSlice.reducer,
    [sentTransactionsSlice.name]: sentTransactionsSlice.reducer,
    [snackbarSlice.name]: snackbarSlice.reducer,
    [modalSlice.name]: modalSlice.reducer,
    [historicWorthChartSlice.name]: historicWorthChartSlice.reducer
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
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
