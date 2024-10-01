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

import { isTxConfirmed } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { confirmedTransactionQuery } from '@/api/queries/transactionQueries'
import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import DataList from '@/components/DataList'
import SkeletonLoader from '@/components/SkeletonLoader'
import Tooltip from '@/components/Tooltip'
import { AddressModalBaseProp, ModalBaseProp } from '@/features/modals/modalTypes'
import AddressesDataRows from '@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows'
import DirectionalInfo from '@/features/transactionsDisplay/transactionDetailsModal/DirectionalInfo'
import FTAmounts from '@/features/transactionsDisplay/transactionDetailsModal/FTAmounts'
import FTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/FTsDataListRow'
import GasUTXOsExpandableSection from '@/features/transactionsDisplay/transactionDetailsModal/GasUTXOsExpandableSection'
import LockTimeDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/LockTimeDataListRow'
import NFTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NFTsDataListRow'
import NSTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NSTsDataListRow'
import TransactionType from '@/features/transactionsDisplay/transactionDetailsModal/TransactionType'
import { TransactionDetailsModalTxHashProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useOpenTxInExplorer from '@/features/transactionsDisplay/transactionDetailsModal/useOpenTxInExplorer'
import SideModal from '@/modals/SideModal'
import { formatDateForDisplay } from '@/utils/misc'

export interface TransactionDetailsModalProps extends AddressModalBaseProp {
  txHash: Transaction['hash']
}

const TransactionDetailsModal = memo(({ id, txHash, addressHash }: ModalBaseProp & TransactionDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <SideModal id={id} title={t('Transaction details')}>
      <Summary txHash={txHash} addressHash={addressHash} />
      <Details txHash={txHash} addressHash={addressHash} />
      <Tooltip />
    </SideModal>
  )
})

export default TransactionDetailsModal

const Summary = ({ txHash, addressHash }: TransactionDetailsModalTxHashProps) => {
  const { t } = useTranslation()

  const handleShowTxInExplorer = useOpenTxInExplorer(txHash)

  const { data: tx } = useQuery(confirmedTransactionQuery({ txHash }))

  return (
    <SummaryStyled>
      <SummaryContent>
        {tx && isTxConfirmed(tx) && (
          <>
            <TransactionType tx={tx} addressHash={addressHash} />
            <FTAmounts tx={tx} addressHash={addressHash} />
            <DirectionalInfo tx={tx} addressHash={addressHash} />
          </>
        )}

        <ActionLink onClick={handleShowTxInExplorer} withBackground>
          {t('Show in explorer')} ↗
        </ActionLink>
      </SummaryContent>
    </SummaryStyled>
  )
}

const Details = ({ txHash, addressHash }: TransactionDetailsModalTxHashProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const { data: tx, isLoading } = useQuery(confirmedTransactionQuery({ txHash }))

  return (
    <DetailsStyled role="table">
      {isLoading && <SkeletonLoader height="400px" />}

      {tx && isTxConfirmed(tx) && (
        <>
          <DataList>
            <AddressesDataRows tx={tx} addressHash={addressHash} />

            <DataList.Row label={t('Status')}>
              {tx.scriptExecutionOk ? (
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
              <span tabIndex={0}>{formatDateForDisplay(tx.timestamp)}</span>
            </DataList.Row>

            <LockTimeDataListRow tx={tx} />

            <DataList.Row label={t('Fee')}>
              <Amount tokenId={ALPH.id} tabIndex={0} value={BigInt(tx.gasAmount) * BigInt(tx.gasPrice)} fullPrecision />
            </DataList.Row>

            <FTsDataListRow tx={tx} addressHash={addressHash} />
            <NFTsDataListRow tx={tx} addressHash={addressHash} />
            <NSTsDataListRow tx={tx} addressHash={addressHash} />
          </DataList>

          <GasUTXOsExpandableSection tx={tx} />
        </>
      )}
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
