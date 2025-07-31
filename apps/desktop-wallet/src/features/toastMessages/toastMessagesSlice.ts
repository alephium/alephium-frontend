import {
  apiClientInitFailed,
  contactDeletedFromPersistentStorage,
  contactStoredInPersistentStorage,
  customNetworkSettingsSaved
} from '@alephium/shared'
import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import i18n from '@/features/localization/i18n'
import { showToast, toastDisplayTimeExpired } from '@/features/toastMessages/toastMessagesActions'
import { toastMessagesAdapter } from '@/features/toastMessages/toastMessagesAdapter'
import { Message, SnackbarMessage, SnackbarMessageInstance } from '@/features/toastMessages/toastMessagesTypes'
import { contactDeletionFailed, contactStorageFailed } from '@/storage/addresses/addressesActions'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import {
  walletConnectPairingFailed,
  walletConnectProposalApprovalFailed,
  walletConnectProposalValidationFailed
} from '@/storage/dApps/dAppActions'
import {
  appDataCleared,
  appDataClearFailed,
  copiedToClipboard,
  copyToClipboardFailed,
  devModeShortcutDetected,
  loadingDataFromLocalStorageFailed,
  localStorageDataMigrationFailed,
  receiveFaucetTokens,
  storingDataToLocalStorageFailed,
  userDataMigrationFailed,
  walletConnectCacheCleared,
  walletConnectCacheClearFailed
} from '@/storage/global/globalActions'
import {
  csvFileGenerationFinished,
  csvFileGenerationStarted,
  fetchTransactionsCsv,
  transactionBuildFailed,
  transactionSendFailed
} from '@/storage/transactions/transactionsActions'
import { newWalletNameStored, walletCreationFailed, walletNameStorageFailed } from '@/storage/wallets/walletActions'

interface ToastMessagesSliceState extends EntityState<SnackbarMessageInstance> {
  offlineMessageWasVisibleOnce: boolean
}

const initialState: ToastMessagesSliceState = toastMessagesAdapter.getInitialState({
  offlineMessageWasVisibleOnce: false
})

const toastMessagesSlice = createSlice({
  name: 'toastMessages',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(toastDisplayTimeExpired, (state, action) => {
        toastMessagesAdapter.removeOne(state, action.payload)
      })
      .addCase(apiClientInitFailed, (state, action) => {
        if (!state.offlineMessageWasVisibleOnce)
          queueMessage(state, {
            text: i18n.t('Could not connect to the {{ currentNetwork }} network.', {
              currentNetwork: action.payload.networkName
            }),
            type: 'error',
            duration: 5000
          })

        state.offlineMessageWasVisibleOnce = true
      })
      .addCase(contactStoredInPersistentStorage, (state) =>
        queueMessage(state, { text: i18n.t('Contact saved'), type: 'success' })
      )
      .addCase(contactDeletedFromPersistentStorage, (state) =>
        queueMessage(state, { text: i18n.t('Contact deleted'), type: 'success' })
      )
      .addCase(customNetworkSettingsSaved, (state) =>
        queueMessage(state, { text: i18n.t('Custom network settings saved.') })
      )
      .addCase(transactionBuildFailed, displayError)
      .addCase(transactionSendFailed, displayError)
      .addCase(contactStorageFailed, displayError)
      .addCase(contactDeletionFailed, displayError)
      .addCase(walletCreationFailed, displayError)
      .addCase(copiedToClipboard, (state, action) =>
        queueMessage(state, { text: action.payload || i18n.t('Copied to clipboard!') })
      )
      .addCase(copyToClipboardFailed, (state, action) =>
        queueMessage(state, { text: action.payload || i18n.t('Copy to clipboard failed'), type: 'error' })
      )
      .addCase(passwordValidationFailed, (state) =>
        queueMessage(state, { text: i18n.t('Invalid password'), type: 'error' })
      )
      .addCase(userDataMigrationFailed, (state) =>
        queueMessage(state, { text: 'User data migration failed', type: 'error' })
      )
      .addCase(localStorageDataMigrationFailed, (state) =>
        queueMessage(state, { text: 'Local storage data migration failed', type: 'error' })
      )
      .addCase(loadingDataFromLocalStorageFailed, (state) =>
        queueMessage(state, { text: 'Loading data from local storage failed', type: 'error' })
      )
      .addCase(storingDataToLocalStorageFailed, (state) =>
        queueMessage(state, { text: 'Storing data to local storage failed', type: 'error' })
      )
      .addCase(devModeShortcutDetected, (state, action) =>
        queueMessage(
          state,
          action.payload.activate
            ? { text: '💪 GOD mode activated!', type: 'success' }
            : { text: '👩‍🌾 Back to a common mortal...' }
        )
      )
      .addCase(newWalletNameStored, (state, action) =>
        queueMessage(state, {
          text: i18n.t('Wallet name updated to: {{ newWalletName }}', { newWalletName: action.payload }),
          type: 'success'
        })
      )
      .addCase(walletNameStorageFailed, displayError)
      .addCase(csvFileGenerationStarted, (state) =>
        queueMessage(state, {
          text: i18n.t('Your CSV file is being compiled in the background.'),
          duration: -1
        })
      )
      .addCase(csvFileGenerationFinished, (state) =>
        queueMessage(state, {
          text: i18n.t('Your CSV file has been generated successfully.'),
          type: 'success'
        })
      )
      .addCase(fetchTransactionsCsv.rejected, (state, action) => {
        const message = action.payload

        if (message) queueMessage(state, message)
      })
      .addCase(walletConnectPairingFailed, displayError)
      .addCase(walletConnectProposalApprovalFailed, displayError)
      .addCase(walletConnectProposalValidationFailed, displayError)
      .addCase(receiveFaucetTokens.fulfilled, (state) =>
        queueMessage(state, {
          text: i18n.t('Test tokens incoming.'),
          type: 'success',
          duration: 5000
        })
      )
      .addCase(receiveFaucetTokens.rejected, (state, action) => {
        const message = action.payload

        if (message) queueMessage(state, message)
      })
      .addCase(walletConnectCacheCleared, (state) => {
        queueMessage(state, {
          text: i18n.t('WalletConnect cache cleared successfully.'),
          type: 'success'
        })
      })
      .addCase(walletConnectCacheClearFailed, (state) => {
        queueMessage(state, {
          text: i18n.t('Could not clear WalletConnect cache.'),
          type: 'error'
        })
      })
      .addCase(appDataCleared, (state) => {
        queueMessage(state, {
          text: i18n.t('App data cleared successfully.'),
          type: 'success'
        })
      })
      .addCase(appDataClearFailed, (state) => {
        queueMessage(state, {
          text: i18n.t('Could not clear app data.'),
          type: 'error'
        })
      })
      .addCase(showToast, (state, { payload: toastMessage }) => {
        const duration = toastMessage.duration === 'short' ? 3000 : 10000

        queueMessage(state, { ...toastMessage, duration })
      })
  }
})

export default toastMessagesSlice

// Reducers helper functions

const defaultSnackbarMessageSettings: Required<SnackbarMessage> = {
  text: '',
  type: 'info',
  duration: 3000 // ms
}

const queueMessage = (state: ToastMessagesSliceState, message: SnackbarMessage) => {
  toastMessagesAdapter.addOne(state, { id: Date.now(), ...defaultSnackbarMessageSettings, ...message })
}

const displayError = (state: ToastMessagesSliceState, action: PayloadAction<Message>) =>
  queueMessage(state, { text: action.payload, type: 'error', duration: 10000 })
