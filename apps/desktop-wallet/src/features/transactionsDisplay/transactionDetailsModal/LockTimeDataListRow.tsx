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

import { useTranslation } from 'react-i18next'

import DataList from '@/components/DataList'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useTransactionLockTime from '@/features/transactionsDisplay/useTransactionLockTime'
import { formatDateForDisplay } from '@/utils/misc'

const LockTimeDataListRow = ({ tx }: Pick<TransactionDetailsModalTxProps, 'tx'>) => {
  const { t } = useTranslation()
  const lockTime = useTransactionLockTime(tx)

  if (!lockTime) return null

  return (
    <DataList.Row label={lockTime < new Date() ? t('Unlocked at') : t('Unlocks at')}>
      <span tabIndex={0}>{formatDateForDisplay(lockTime)}</span>
    </DataList.Row>
  )
}

export default LockTimeDataListRow
