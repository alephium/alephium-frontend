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

import useFetchAddressInfiniteTransactions from '@/api/apiDataHooks/address/useFetchAddressInfiniteTransactions'
import Table, { TableHeader } from '@/components/Table'
import AddressTransactionsCSVExportButton from '@/features/csvExport/AddressTransactionsCSVExportButton'
import { openModal } from '@/features/modals/modalActions'
import NewTransactionsButtonRow from '@/features/transactionsDisplay/transactionLists/NewTransactionsButtonRow'
import TableRowsLoader from '@/features/transactionsDisplay/transactionLists/TableRowsLoader'
import TransactionsListFooter from '@/features/transactionsDisplay/transactionLists/TransactionsListFooter'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch } from '@/hooks/redux'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressTransactionListProps {
  addressHash: AddressHash
}

const AddressTransactionsList = ({ addressHash }: AddressTransactionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const {
    data: confirmedTxs,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refresh,
    showNewTxsMessage
  } = useFetchAddressInfiniteTransactions({
    addressHash
  })

  const openTransactionDetailsModal = (txHash: e.Transaction['hash']) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash, refAddressHash: addressHash } }))

  return (
    <Table minWidth="500px">
      <TableHeader title={t('Address transactions')}>
        <AddressTransactionsCSVExportButton addressHash={addressHash} />
      </TableHeader>

      {isLoading && <TableRowsLoader />}

      {showNewTxsMessage && <NewTransactionsButtonRow onClick={refresh} />}

      {confirmedTxs?.map((tx) => (
        <TransactionRow
          key={tx.hash}
          tx={tx}
          refAddressHash={addressHash}
          isInAddressDetailsModal
          compact
          onClick={() => openTransactionDetailsModal(tx.hash)}
          onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash))}
        />
      ))}

      {!isLoading && (
        <TransactionsListFooter
          isDisplayingTxs={confirmedTxs && confirmedTxs?.length > 0}
          showLoadMoreBtn={hasNextPage}
          showSpinner={isFetchingNextPage}
          onShowMoreClick={fetchNextPage}
          noTxsMsg={t("This address doesn't have any transactions yet.")}
          allTxsLoadedMsg={t('All the transactions of this address were loaded!')}
        />
      )}
    </Table>
  )
}

export default AddressTransactionsList
