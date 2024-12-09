/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
