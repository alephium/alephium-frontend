import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { showToast } from '@/features/toastMessages/toastMessagesActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

export const useLedger = () => {
  const isLedger = useAppSelector((s) => !!s.activeWallet.isLedger)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const onLedgerError = useCallback(
    (error: Error) => {
      console.error(error)
      dispatch(showToast({ text: `${t('Could not connect to Alephium Ledger app')}`, type: 'error', duration: 'long' }))
    },
    [dispatch, t]
  )

  return {
    isLedger,
    onLedgerError
  }
}
