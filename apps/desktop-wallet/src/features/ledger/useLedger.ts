import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { showToast } from '@/storage/global/globalActions'

export const useLedger = () => {
  const isLedger = useAppSelector((s) => !!s.activeWallet.isLedger)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const onLedgerError = useCallback(
    (error: Error) => {
      console.error(error)
      dispatch(showToast({ text: `${t('Could not connect to Alephium Ledger app')}`, type: 'alert', duration: 'long' }))
    },
    [dispatch, t]
  )

  return {
    isLedger,
    onLedgerError
  }
}
