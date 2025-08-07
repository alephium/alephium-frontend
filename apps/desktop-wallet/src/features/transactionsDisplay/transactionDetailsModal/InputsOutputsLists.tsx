import {
  GENESIS_TIMESTAMP,
  getTransactionDestinationAddresses,
  getTransactionOriginAddresses,
  isConfirmedTx,
  selectPendingSentTransactionByHash,
  UseTransactionProps
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Badge from '@/components/Badge'
import ClickableAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/ClickableAddressBadge'
import PendingSentAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/PendingSentAddressBadge'
import { useAppSelector } from '@/hooks/redux'

interface InputsListProps extends UseTransactionProps {
  tx: e.Transaction | e.PendingTransaction
}

export const TransactionOriginAddressesList = ({ tx, referenceAddress }: InputsListProps) => {
  const { t } = useTranslation()

  const addresses = useMemo(() => getTransactionOriginAddresses({ tx, referenceAddress }), [tx, referenceAddress])

  const timestamp = isConfirmedTx(tx) ? tx.timestamp : undefined

  if (timestamp === GENESIS_TIMESTAMP) {
    return <Badge>{t('Genesis TX')}</Badge>
  }

  if (!tx.inputs || tx.inputs.length === 0) {
    return <Badge>{t('Mining Rewards')}</Badge>
  }

  return (
    <AddressesList>
      {addresses.map((address) => (
        <ClickableAddressBadge address={address} key={address} />
      ))}
    </AddressesList>
  )
}

export const TransactionDestinationAddressesList = ({ tx, referenceAddress }: InputsListProps) => {
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  const addresses = useMemo(() => getTransactionDestinationAddresses({ tx, referenceAddress }), [tx, referenceAddress])

  if (pendingSentTx) {
    return <PendingSentAddressBadge tx={tx} referenceAddress={referenceAddress} isDestinationAddress />
  }

  return (
    <AddressesList>
      {addresses.map((address) => (
        <ClickableAddressBadge address={address} key={address} />
      ))}
    </AddressesList>
  )
}

const AddressesList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  overflow: hidden;
  gap: 5px;
`
