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
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useFetchAddressLastTransactionHash from '@/api/apiDataHooks/address/useFetchAddressLastTransactionHash'
import { addressTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import ActionLink from '@/components/ActionLink'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Table, { TableCell, TableCellPlaceholder, TableHeader, TableRow } from '@/components/Table'
import AddressTransactionsCSVExportButton from '@/features/csvExport/AddressTransactionsCSVExportButton'
import { openModal } from '@/features/modals/modalActions'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { makeSelectAddressesPendingTransactions } from '@/storage/transactions/transactionsSelectors'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressTransactionListProps {
  addressHash: AddressHash
}

const AddressTransactionList = ({ addressHash }: AddressTransactionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const selectAddressesPendingTransactions = useMemo(makeSelectAddressesPendingTransactions, [])
  const pendingTxs = useAppSelector((s) => selectAddressesPendingTransactions(s, [addressHash])) // TODO

  const { data } = useFetchAddressLastTransactionHash(addressHash)
  const {
    data: confirmedTxsPages,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(
    addressTransactionsInfiniteQuery({
      addressHash,
      latestTxHash: data?.latestTxHash,
      previousTxHash: data?.previousTxHash,
      networkId
    })
  )

  const openTransactionDetailsModal = (txHash: Transaction['hash']) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash, addressHash } }))

  const confirmedTxs = confirmedTxsPages?.pages.flat()

  return (
    <Table minWidth="500px">
      <TableHeader title={t('Address transactions')}>
        <AddressTransactionsCSVExportButton addressHash={addressHash} />
      </TableHeader>

      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        ))}

      {pendingTxs.map((tx) => (
        <TransactionRow key={tx.hash} tx={tx} addressHash={addressHash} isInAddressDetailsModal compact blinking />
      ))}

      {confirmedTxs?.map((tx) => (
        <TransactionRow
          key={tx.hash}
          tx={tx}
          addressHash={addressHash}
          isInAddressDetailsModal
          compact
          onClick={() => openTransactionDetailsModal(tx.hash)}
          onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash))}
        />
      ))}

      {!isLoading && confirmedTxs && confirmedTxs?.length > 0 && (
        <TableRow role="row">
          <TableCell align="center" role="gridcell">
            {!hasNextPage ? (
              <span>{t('All transactions loaded!')}</span>
            ) : isFetchingNextPage ? (
              <Spinner size="15px" />
            ) : (
              <ActionLink onClick={fetchNextPage}>{t('Show more')}</ActionLink>
            )}
          </TableCell>
        </TableRow>
      )}

      {!isLoading && pendingTxs.length === 0 && (!confirmedTxs || confirmedTxs.length === 0) && (
        <TableRow role="row" tabIndex={0}>
          <TableCellPlaceholder align="center">{t('No transactions to display')}</TableCellPlaceholder>
        </TableRow>
      )}
    </Table>
  )
}

export default AddressTransactionList
