import { selectSentTransactionByHash } from '@alephium/shared'
import { usePendingTxPolling } from '@alephium/shared-react'
import { colord } from 'colord'
import { Check } from 'lucide-react-native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import { useTheme } from 'styled-components/native'

import ListItem, { ListItemProps } from '~/components/ListItem'
import TransactionIcon from '~/features/transactionsDisplay/TransactionIcon'
import TransactionListItemAmounts from '~/features/transactionsDisplay/TransactionListItemAmounts'
import { useAppSelector } from '~/hooks/redux'

interface SentTransactionListItemProps extends Partial<ListItemProps> {
  txHash: string
}

// Represents a transaction the user has sent using the app, similar to the transaction snackbar in the desktop wallet.
// In the UI it looks similar to the TransactionListItem component. The difference is that its data do not come from the
// explorer, but from the local state. It's used to display pending transactions before they appear in the txs infinite
// query.
const SentTransactionListItem = memo(({ txHash, ...props }: SentTransactionListItemProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const sentTransaction = useAppSelector((state) => selectSentTransactionByHash(state, txHash))

  usePendingTxPolling(txHash)

  if (!sentTransaction) return null

  const label = sentTransaction.status === 'mempooled' ? t('Pending') : t('Sent')
  const iconColor = sentTransaction.status === 'confirmed' ? theme.global.valid : theme.font.secondary
  const iconBgColor = colord(iconColor).alpha(0.11).toRgbString()

  return (
    <ListItem
      {...props}
      title={label}
      icon={
        <TransactionIcon color={iconBgColor}>
          {sentTransaction.status === 'confirmed' ? (
            <Check size={16} color={iconColor} />
          ) : (
            <ActivityIndicator size={16} color={iconColor} />
          )}
        </TransactionIcon>
      }
      rightSideContent={
        <TransactionListItemAmounts tx={sentTransaction} refAddressHash={sentTransaction.fromAddress} />
      }
    />
  )
})

export default SentTransactionListItem
