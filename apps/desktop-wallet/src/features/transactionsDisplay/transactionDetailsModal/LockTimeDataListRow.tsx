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
