import { AddressHash, selectPendingSentTransactionByHash } from '@alephium/shared'
import { useTransactionDirection } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import AddressBadge from '@/components/AddressBadge'
import Badge from '@/components/Badge'
import { useAppSelector } from '@/hooks/redux'

interface PendingSentAddressBadgeProps {
  tx: e.Transaction | e.PendingTransaction
  referenceAddress: AddressHash
  isDestinationAddress?: boolean
}

const PendingSentAddressBadge = ({ tx, referenceAddress, isDestinationAddress }: PendingSentAddressBadgeProps) => {
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))
  const direction = useTransactionDirection(tx, referenceAddress)

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
