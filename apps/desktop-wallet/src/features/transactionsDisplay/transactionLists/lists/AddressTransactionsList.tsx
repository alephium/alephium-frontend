import { AddressHash } from '@alephium/shared'
import { useFetchAddressInfiniteTransactions } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import Table, { TableHeader } from '@/components/Table'
import AddressTransactionsCSVExportButton from '@/features/csvExport/AddressTransactionsCSVExportButton'
import { openModal } from '@/features/modals/modalActions'
import OfflineMessage from '@/features/offline/OfflineMessage'
import NewTransactionsButtonRow from '@/features/transactionsDisplay/transactionLists/NewTransactionsButtonRow'
import TableRowsLoader from '@/features/transactionsDisplay/transactionLists/TableRowsLoader'
import TransactionsListFooter from '@/features/transactionsDisplay/transactionLists/TransactionsListFooter'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressTransactionListProps {
  addressHash: AddressHash
}

const AddressTransactionsList = ({ addressHash }: AddressTransactionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const explorerStatus = useAppSelector((s) => s.network.explorerStatus)

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
      <TableHeader>
        <AddressTransactionsCSVExportButton addressHash={addressHash} />
      </TableHeader>

      {explorerStatus === 'offline' && <OfflineMessage />}

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
