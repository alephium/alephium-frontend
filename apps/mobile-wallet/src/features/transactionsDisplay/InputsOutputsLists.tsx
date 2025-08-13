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
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import PendingSentAddressBadge from '~/features/transactionsDisplay/PendingSentAddressBadge'
import { useAppSelector } from '~/hooks/redux'

interface InputsListProps extends UseTransactionProps {
  tx: e.Transaction | e.PendingTransaction
}

export const TransactionOriginAddressesList = ({ tx, referenceAddress }: InputsListProps) => {
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  const addresses = useMemo(() => getTransactionOriginAddresses({ tx, referenceAddress }), [tx, referenceAddress])

  if (pendingSentTx) {
    return <PendingSentAddressBadge txHash={tx.hash} direction="from" />
  }

  if (isConfirmedTx(tx) && tx.timestamp === GENESIS_TIMESTAMP) {
    return <AppText bold>{t('Genesis TX')}</AppText>
  }

  if (!tx.inputs || tx.inputs.length === 0) {
    return <AppText bold>{t('Mining Rewards')}</AppText>
  }

  return (
    <AddressesList>
      {addresses.map((address) => (
        <AddressBadge addressHash={address} key={address} />
      ))}
    </AddressesList>
  )
}

export const TransactionDestinationAddressesList = ({ tx, referenceAddress }: InputsListProps) => {
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  const addresses = useMemo(() => getTransactionDestinationAddresses({ tx, referenceAddress }), [tx, referenceAddress])

  if (pendingSentTx) {
    return <PendingSentAddressBadge txHash={tx.hash} direction="to" />
  }

  return (
    <AddressesList>
      {addresses.map((address) => (
        <AddressBadge addressHash={address} key={address} />
      ))}
    </AddressesList>
  )
}

const AddressesList = styled.View`
  align-items: flex-end;
  overflow: hidden;
  gap: 5px;
`
