import {
  AddressHash,
  exponentialBackoffFetchRetry,
  SentTransaction,
  throttledClient,
  transactionSent
} from '@alephium/shared'
import { transactionSign } from '@alephium/web3'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

import i18n from '@/features/localization/i18n'
import { ThemeType } from '@/features/theme/themeTypes'
import { OptionalMessage, SnackbarMessage } from '@/features/toastMessages/toastMessagesTypes'
import { RootState } from '@/storage/store'

type ModalId = string

export const copiedToClipboard = createAction<OptionalMessage>('app/copiedToClipboard')

export const copyToClipboardFailed = createAction<OptionalMessage>('app/copyToClipboardFailed')

export const localStorageDataMigrationFailed = createAction('app/localStorageDataMigrationFailed')

export const loadingDataFromLocalStorageFailed = createAction('app/loadingDataFromLocalStorageFailed')

export const storingDataToLocalStorageFailed = createAction('app/storingDataToLocalStorageFailed')

export const modalOpened = createAction<ModalId>('app/modalOpened')

export const modalClosed = createAction('app/modalClosed')

export const osThemeChangeDetected = createAction<ThemeType>('app/osThemeChangeDetected')

export const devModeShortcutDetected = createAction<{ activate: boolean }>('app/devModeShortcutDetected')

export const userDataMigrationFailed = createAction('app/userDataMigrationFailed')

export const walletConnectCacheCleared = createAction('app/walletConnectCacheCleared')

export const walletConnectCacheClearFailed = createAction('app/walletConnectCacheClearFailed')

export const toggleAppLoading = createAction<boolean>('app/toggleAppLoading')

export const appDataCleared = createAction('app/appDataCleared')

export const appDataClearFailed = createAction('app/appDataClearFailed')

export const receiveFaucetTokens = createAsyncThunk<SentTransaction, AddressHash, { rejectValue: SnackbarMessage }>(
  'assets/receiveFaucetTokens',
  async (destinationAddress: AddressHash, { getState, rejectWithValue, fulfillWithValue, dispatch }) => {
    const state = getState() as RootState
    const currentNetwork = state.network

    if (!['testnet', 'devnet'].includes(currentNetwork.name))
      return rejectWithValue({
        text: i18n.t('You need to be on testnet or devnet in order to use the faucet.'),
        type: 'error'
      })

    const txBoilerplate: Omit<SentTransaction, 'hash'> = {
      fromAddress: 'Faucet',
      toAddress: destinationAddress,
      amount: undefined,
      timestamp: new Date().getTime(),
      status: 'sent',
      type: 'faucet'
    }

    if (currentNetwork.name === 'devnet') {
      throttledClient.init(currentNetwork.settings.nodeHost, currentNetwork.settings.explorerApiHost)

      const faucetPublicKey = '0381818e63bd9e35a5489b52a430accefc608fd60aa2c7c0d1b393b5239aedf6b0'
      const faucetPrivateKey = 'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'

      const builtTx = await throttledClient.node.transactions.postTransactionsBuild({
        fromPublicKey: faucetPublicKey,
        destinations: [
          {
            address: destinationAddress,
            attoAlphAmount: BigInt(1e21).toString()
          }
        ]
      })

      const txRes = await throttledClient.node.transactions.postTransactionsSubmit({
        unsignedTx: builtTx.unsignedTx,
        signature: transactionSign(builtTx.txId, faucetPrivateKey)
      })

      return fulfillWithValue({
        ...txBoilerplate,
        hash: txRes.txId
      })
    }

    const response = await exponentialBackoffFetchRetry('https://faucet.testnet.alephium.org/send', {
      method: 'POST',
      body: destinationAddress
    })

    if (!response.ok) {
      return rejectWithValue({
        text:
          response.status === 429
            ? i18n.t('You have reached the maximum calls limit. Please try again in a few minutes.')
            : i18n.t('Encountered error while calling the faucet.'),
        type: 'error'
      })
    }

    const responseURL = (await response.text()).trim()

    const hash = responseURL.match(/\/([a-fA-F0-9]+)$/)?.[1] || ''

    dispatch(
      transactionSent({
        ...txBoilerplate,
        hash: hash
      })
    )

    return fulfillWithValue({
      ...txBoilerplate,
      hash: hash
    })
  }
)
