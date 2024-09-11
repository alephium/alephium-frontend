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
import { ALPH } from '@alephium/token-list'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import DataList from '@/components/DataList'
import Tooltip from '@/components/Tooltip'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import AddressesDataRows from '@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows'
import DirectionalInfo from '@/features/transactionsDisplay/transactionDetailsModal/DirectionalInfo'
import FTAmounts from '@/features/transactionsDisplay/transactionDetailsModal/FTAmounts'
import FTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/FTsDataListRow'
import GasUTXOsExpandableSection from '@/features/transactionsDisplay/transactionDetailsModal/GasUTXOsExpandableSection'
import LockTimeDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/LockTimeDataListRow'
import NFTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NFTsDataListRow'
import NSTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NSTsDataListRow'
import TransactionType from '@/features/transactionsDisplay/transactionDetailsModal/TransactionType'
import { TransactionDetailsModalSectionProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useOpenTxInExplorer from '@/features/transactionsDisplay/transactionDetailsModal/useOpenTxInExplorer'
import { useAppSelector } from '@/hooks/redux'
import SideModal from '@/modals/SideModal'
import { selectConfirmedTransactionByHash } from '@/storage/transactions/transactionsSelectors'
import { formatDateForDisplay } from '@/utils/misc'

export interface TransactionDetailsModalProps {
  txHash: Transaction['hash']
  addressHash: AddressHash
}

const TransactionDetailsModal = memo(({ id, txHash, addressHash }: ModalBaseProp & TransactionDetailsModalProps) => {
  const { t } = useTranslation()
  const tx = useAppSelector((s) => selectConfirmedTransactionByHash(s, txHash))

  if (!tx) return null

  return (
    <SideModal id={id} title={t('Transaction details')}>
      <Summary tx={tx} addressHash={addressHash} />
      <Details tx={tx} addressHash={addressHash} />
      <Tooltip />
    </SideModal>
  )
})

export default TransactionDetailsModal

const Summary = (props: TransactionDetailsModalSectionProps) => {
  const { t } = useTranslation()
  const handleShowTxInExplorer = useOpenTxInExplorer(props.tx.hash)

  return (
    <SummaryStyled>
      <SummaryContent>
        <TransactionType {...props} />
        <FTAmounts {...props} />
        <DirectionalInfo {...props} />
        <ActionLink onClick={handleShowTxInExplorer} withBackground>
          {t('Show in explorer')} ↗
        </ActionLink>
      </SummaryContent>
    </SummaryStyled>
  )
}

const Details = (props: TransactionDetailsModalSectionProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <DetailsStyled role="table">
      <DataList>
        <AddressesDataRows {...props} />

        <DataList.Row label={t('Status')}>
          {props.tx.scriptExecutionOk ? (
            <Badge color={theme.global.valid}>
              <span tabIndex={0}>{t('Confirmed')}</span>
            </Badge>
          ) : (
            <Badge color={theme.global.alert}>
              <span tabIndex={0}>{t('Script execution failed')}</span>
            </Badge>
          )}
        </DataList.Row>

        <DataList.Row label={t('Timestamp')}>
          <span tabIndex={0}>{formatDateForDisplay(props.tx.timestamp)}</span>
        </DataList.Row>

        <LockTimeDataListRow tx={props.tx} />

        <DataList.Row label={t('Fee')}>
          <Amount
            tokenId={ALPH.id}
            tabIndex={0}
            value={BigInt(props.tx.gasAmount) * BigInt(props.tx.gasPrice)}
            fullPrecision
          />
        </DataList.Row>

        <FTsDataListRow {...props} />
        <NFTsDataListRow {...props} />
        <NSTsDataListRow {...props} />
      </DataList>

      <GasUTXOsExpandableSection tx={props.tx} />
    </DetailsStyled>
  )
}

const SummaryStyled = styled.div`
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
`

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5);
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
`

const DetailsStyled = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`
