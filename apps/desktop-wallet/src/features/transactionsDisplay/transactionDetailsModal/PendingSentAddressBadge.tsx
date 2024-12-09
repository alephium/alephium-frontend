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
