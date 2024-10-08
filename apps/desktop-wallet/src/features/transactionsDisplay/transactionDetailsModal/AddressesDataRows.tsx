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

import { isConfirmedTx } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import DataList from '@/components/DataList'
import HashEllipsed from '@/components/HashEllipsed'
import IOList from '@/components/IOList'
import { selectPendingSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import PendingSentAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/PendingSentAddressBadge'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useOnAddressClick from '@/features/transactionsDisplay/transactionDetailsModal/useOnAddressClick'
import useOpenTxInExplorer from '@/features/transactionsDisplay/transactionDetailsModal/useOpenTxInExplorer'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'
import { useAppSelector } from '@/hooks/redux'

const AddressesDataRows = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, refAddressHash)
  const onAddressClick = useOnAddressClick()
  const handleShowTxInExplorer = useOpenTxInExplorer(tx.hash)
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  if (direction === 'swap') return null

  const handleAddressClick = () => onAddressClick(refAddressHash)

  return (
    <>
      <DataList.Row label={t('Transaction hash')}>
        <TransactionHash onClick={handleShowTxInExplorer}>
          <HashEllipsed hash={tx.hash} tooltipText={t('Copy hash')} />
        </TransactionHash>
      </DataList.Row>
      <DataList.Row label={t('From')}>
        {direction === 'out' ? (
          <ActionLinkStyled onClick={handleAddressClick}>
            <AddressBadge addressHash={refAddressHash} truncate withBorders />
          </ActionLinkStyled>
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={false}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
            linkToExplorer
          />
        )}
      </DataList.Row>
      <DataList.Row label={t('To')}>
        {pendingSentTx ? (
          <PendingSentAddressBadge tx={tx} refAddressHash={refAddressHash} isDestinationAddress />
        ) : direction !== 'out' ? (
          <ActionLinkStyled onClick={handleAddressClick} key={refAddressHash}>
            <AddressBadge addressHash={refAddressHash} truncate withBorders />
          </ActionLinkStyled>
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={direction === 'out'}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
            linkToExplorer
          />
        )}
      </DataList.Row>
    </>
  )
}

export default AddressesDataRows

const TransactionHash = styled(ActionLink)`
  max-width: 125px;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: flex-end;
`
