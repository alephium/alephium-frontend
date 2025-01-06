import { AddressHash } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import AddressBadge from '@/components/AddressBadge'
import Badge from '@/components/Badge'
import { selectPendingSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'
import { useAppSelector } from '@/hooks/redux'

interface PendingSentAddressBadgeProps {
  tx: e.Transaction | e.PendingTransaction
  refAddressHash: AddressHash
  isDestinationAddress?: boolean
}

const PendingSentAddressBadge = ({ tx, refAddressHash, isDestinationAddress }: PendingSentAddressBadgeProps) => {
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))
  const direction = useTransactionDirection(tx, refAddressHash)

  if (!pendingSentTx) return null

  if (pendingSentTx.type === 'contract') return <Badge>{t('Smart contract')}</Badge>

  if (pendingSentTx.type === 'faucet') return <Badge>{t('Token faucet')}</Badge>

  return (
    <AddressBadge
      truncate
      addressHash={isDestinationAddress || direction !== 'in' ? pendingSentTx.toAddress : pendingSentTx.fromAddress}
    />
  )
}

export default PendingSentAddressBadge
