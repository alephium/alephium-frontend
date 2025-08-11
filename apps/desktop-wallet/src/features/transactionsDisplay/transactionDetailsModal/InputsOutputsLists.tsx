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
import PendingSentAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/PendingSentAddressBadge'
import TransactionAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/TransactionAddressBadge'
import { useAppSelector } from '@/hooks/redux'

interface InputsListProps extends UseTransactionProps {
  tx: e.Transaction | e.PendingTransaction
  hideLink?: boolean
  truncate?: boolean
}

export const TransactionOriginAddressesList = ({ tx, referenceAddress, hideLink }: InputsListProps) => {
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  const addresses = useMemo(() => getTransactionOriginAddresses({ tx, referenceAddress }), [tx, referenceAddress])

  if (pendingSentTx) {
    return <PendingSentAddressBadge txHash={tx.hash} direction="from" />
  }

  if (GENESIS_TIMESTAMP === (isConfirmedTx(tx) ? tx.timestamp : undefined)) {
    return <Badge>{t('Genesis TX')}</Badge>
  }

  if (!tx.inputs || tx.inputs.length === 0) {
    return <Badge>{t('Mining Rewards')}</Badge>
  }

  return (
    <AddressesList>
      {addresses.map((address) => (
        <TransactionAddressBadge address={address} key={address} hideLink={hideLink} />
      ))}
    </AddressesList>
  )
}

export const TransactionDestinationAddressesList = ({ tx, referenceAddress, truncate, hideLink }: InputsListProps) => {
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  const addresses = useMemo(() => getTransactionDestinationAddresses({ tx, referenceAddress }), [tx, referenceAddress])

  if (pendingSentTx) {
    return <PendingSentAddressBadge txHash={tx.hash} direction="to" />
  }

  if (addresses.length > 1 && truncate) {
    return (
      <TruncateWrap>
        <TransactionAddressBadge address={addresses[0]} hideLink={hideLink} />
        <ExtraAddressesText>(+{addresses.length - 1})</ExtraAddressesText>
      </TruncateWrap>
    )
  }

  return (
    <AddressesList>
      {addresses.map((address) => (
        <TransactionAddressBadge address={address} key={address} hideLink={hideLink} />
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

const TruncateWrap = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  text-align: left;
`

const ExtraAddressesText = styled.div`
  margin-left: 0.5em;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`
