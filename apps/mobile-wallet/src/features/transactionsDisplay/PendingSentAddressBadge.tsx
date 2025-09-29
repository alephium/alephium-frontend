import { selectPendingSentTransactionByHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import AddressBadge from '~/components/AddressBadge'
import Badge from '~/components/Badge'
import { useAppSelector } from '~/hooks/redux'

interface PendingSentAddressBadgeProps {
  txHash: string
  direction: 'from' | 'to'
}

const PendingSentAddressBadge = ({ txHash, direction }: PendingSentAddressBadgeProps) => {
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, txHash))

  if (!pendingSentTx) return null

  if (direction === 'from') return <AddressBadge addressHash={pendingSentTx.fromAddress} />

  if (pendingSentTx.type === 'contract') return <Badge>{t('Smart contract')}</Badge>

  return <AddressBadge addressHash={pendingSentTx.toAddress} />
}

export default PendingSentAddressBadge
