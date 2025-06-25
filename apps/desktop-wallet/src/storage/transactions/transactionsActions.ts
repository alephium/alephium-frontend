import { getHumanReadableError } from '@alephium/shared'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import posthog from 'posthog-js'

import { fetchCsv } from '@/api/transactions'
import i18n from '@/features/localization/i18n'
import { Message, SnackbarMessage } from '@/features/toastMessages/toastMessagesTypes'
import { CsvExportQueryParams } from '@/types/transactions'

// TODO: Move into these features:
// - send
// - walletConnect

export const transactionBuildFailed = createAction<Message>('tx/transactionBuildFailed')

export const transactionSendFailed = createAction<Message>('tx/transactionSendFailed')

export const csvFileGenerationStarted = createAction('tx/csvFileGenerationStarted')

export const csvFileGenerationFinished = createAction('tx/csvFileGenerationFinished')

export const fetchTransactionsCsv = createAsyncThunk<string, CsvExportQueryParams, { rejectValue: SnackbarMessage }>(
  'tx/fetchTransactionsCsv',
  async (queryParams: CsvExportQueryParams, { dispatch, rejectWithValue }) => {
    dispatch(csvFileGenerationStarted())

    try {
      return await fetchCsv(queryParams)
    } catch (e) {
      posthog.capture('Error', { message: 'Fetching CSV' })
      return rejectWithValue({
        text: getHumanReadableError(e, i18n.t('Encountered error while exporting your transactions.')),
        type: 'error'
      })
    }
  }
)
