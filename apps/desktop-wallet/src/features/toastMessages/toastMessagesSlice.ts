import {
  apiClientInitFailed,
  contactDeletedFromPersistentStorage,
  contactStoredInPersistentStorage,
  customNetworkSettingsSaved
} from '@alephium/shared'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from 'nanoid'

import i18n from '@/features/localization/i18n'
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
  showToast,
  storingDataToLocalStorageFailed,
  toastDisplayTimeExpired,
  userDataMigrationFailed,
  walletConnectCacheCleared,
  walletConnectCacheClearFailed
} from '@/storage/global/globalActions'
import {
  csvFileGenerationFinished,
  csvFileGenerationStarted,
  fetchTransactionsCsv,
  messageSignFailed,
  transactionBuildFailed,
  transactionSendFailed,
  unsignedTransactionDecodingFailed,
  unsignedTransactionSignFailed
} from '@/storage/transactions/transactionsActions'
import { newWalletNameStored, walletCreationFailed, walletNameStorageFailed } from '@/storage/wallets/walletActions'
import { Message, SnackbarMessage } from '@/types/snackbar'

export type SnackbarMessageInstance = Required<SnackbarMessage> & { id: string }

interface SnackbarSliceState {
  messages: SnackbarMessageInstance[]
  offlineMessageWasVisibleOnce: boolean
}

const initialState: SnackbarSliceState = {
  messages: [],
  offlineMessageWasVisibleOnce: false
}

const toastMessagesSlice = createSlice({
  name: 'toastMessages',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(toastDisplayTimeExpired, (state) => {
        if (state.messages.length > 0) state.messages.shift()
      })
      .addCase(apiClientInitFailed, (state, action) => {
        if (!state.offlineMessageWasVisibleOnce)
          queueMessage(state, {
            text: i18n.t('Could not connect to the {{ currentNetwork }} network.', {
              currentNetwork: action.payload.networkName
            }),
            type: 'alert',
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
      .addCase(unsignedTransactionSignFailed, displayError)
      .addCase(unsignedTransactionDecodingFailed, displayError)
      .addCase(messageSignFailed, displayError)
      .addCase(transactionSendFailed, displayError)
      .addCase(contactStorageFailed, displayError)
      .addCase(contactDeletionFailed, displayError)
      .addCase(walletCreationFailed, displayError)
      .addCase(copiedToClipboard, (state, action) =>
        queueMessage(state, { text: action.payload || i18n.t('Copied to clipboard!') })
      )
      .addCase(copyToClipboardFailed, (state, action) =>
        queueMessage(state, { text: action.payload || i18n.t('Copy to clipboard failed'), type: 'alert' })
      )
      .addCase(passwordValidationFailed, (state) =>
        queueMessage(state, { text: i18n.t('Invalid password'), type: 'alert' })
      )
      .addCase(userDataMigrationFailed, (state) =>
        queueMessage(state, { text: 'User data migration failed', type: 'alert' })
      )
      .addCase(localStorageDataMigrationFailed, (state) =>
        queueMessage(state, { text: 'Local storage data migration failed', type: 'alert' })
      )
      .addCase(loadingDataFromLocalStorageFailed, (state) =>
        queueMessage(state, { text: 'Loading data from local storage failed', type: 'alert' })
      )
      .addCase(storingDataToLocalStorageFailed, (state) =>
        queueMessage(state, { text: 'Storing data to local storage failed', type: 'alert' })
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
          type: 'alert'
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
          type: 'alert'
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

const queueMessage = (state: SnackbarSliceState, message: SnackbarMessage) => {
  state.messages.push({ id: nanoid(), ...defaultSnackbarMessageSettings, ...message })
}

const displayError = (state: SnackbarSliceState, action: PayloadAction<Message>) =>
  queueMessage(state, { text: action.payload, type: 'alert', duration: 10000 })
