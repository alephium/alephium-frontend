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

import { AddressHash, findTransactionReferenceAddress } from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import { uniqBy } from 'lodash'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useFetchWalletLastTransaction } from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactions'
import { walletLatestTransactionsQuery } from '@/api/queries/transactionQueries'
import ActionLink from '@/components/ActionLink'
import Table, { TableCellPlaceholder, TableHeader, TableRow } from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import TableRowsLoader from '@/features/transactionsDisplay/transactionLists/TableRowsLoader'
import TransactionsListFooter from '@/features/transactionsDisplay/transactionLists/TransactionsListFooter'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { onEnterOrSpace } from '@/utils/misc'

const WalletLatestTransactionsList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const allAddressHashes = useAppSelector(selectAllAddressHashes)

  const { data } = useFetchWalletLastTransaction()
  const { data: confirmedTxs, isLoading } = useQuery(
    walletLatestTransactionsQuery({
      allAddressHashes,
      latestTxHash: data?.latestTx?.hash,
      previousTxHash: data?.previousTx?.hash,
      networkId
    })
  )

  const openTransactionDetailsModal = (txHash: Transaction['hash'], addressHash: AddressHash) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash, addressHash } }))

  return (
    <Table minWidth="500px">
      <TableHeader title={t('Latest transactions')}>
        <ActionLinkStyled onClick={() => navigate('/wallet/transfers')} Icon={ChevronRight} withBackground>
          {t('See more')}
        </ActionLinkStyled>
      </TableHeader>

      {isLoading && <TableRowsLoader />}

      {/* TODO: Remove uniqBy once backend removes duplicates from its results */}
      {uniqBy(confirmedTxs, 'hash').map((tx) => {
        const txRefAddress = findTransactionReferenceAddress(allAddressHashes, tx)

        if (!txRefAddress) return null

        return (
          <TransactionRow
            key={tx.hash}
            tx={tx}
            addressHash={txRefAddress}
            onClick={() => openTransactionDetailsModal(tx.hash, txRefAddress)}
            onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash, txRefAddress))}
          />
        )
      })}

      {!isLoading && (
        <TransactionsListFooter
          isDisplayingTxs={(confirmedTxs?.length ?? 0) > 0}
          showLoadMoreBtn={false}
          showSpinner={false}
          noTxsMsg={t('No transactions to display')}
        />
      )}

      {!isLoading && (!confirmedTxs || confirmedTxs.length === 0) && (
        <TableRow role="row" tabIndex={0}>
          <TableCellPlaceholder align="center">{t('No transactions to display')}</TableCellPlaceholder>
        </TableRow>
      )}
    </Table>
  )
}

export default WalletLatestTransactionsList

const ActionLinkStyled = styled(ActionLink)`
  margin-left: 20px;
`