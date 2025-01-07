import {
  AddressHash,
  Asset,
  calcTxAmountsDeltaForAddress,
  findTransactionReferenceAddress,
  TRANSACTIONS_PAGE_DEFAULT_LIMIT
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { orderBy, uniqBy } from 'lodash'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useFetchWalletTransactionsInfinite from '@/api/apiDataHooks/wallet/useFetchWalletTransactionsInfinite'
import Table from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import { getTransactionInfoType } from '@/features/transactionsDisplay/transactionDisplayUtils'
import NewTransactionsButtonRow from '@/features/transactionsDisplay/transactionLists/NewTransactionsButtonRow'
import TableRowsLoader from '@/features/transactionsDisplay/transactionLists/TableRowsLoader'
import TransactionsListFooter from '@/features/transactionsDisplay/transactionLists/TransactionsListFooter'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { Direction } from '@/types/transactions'
import { onEnterOrSpace } from '@/utils/misc'

interface WalletTransactionListProps {
  addressHashes?: AddressHash[]
  directions?: Direction[]
  assetIds?: Asset['id'][]
}

const WalletTransactionsList = ({ addressHashes, directions, assetIds }: WalletTransactionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const allAddressHashes = useUnsortedAddressesHashes()

  const {
    data: fetchedConfirmedTxs,
    isLoading,
    refresh,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    showNewTxsMessage,
    pagesLoaded
  } = useFetchWalletTransactionsInfinite()

  const openTransactionDetailsModal = (txHash: e.Transaction['hash']) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash } }))

  const filteredConfirmedTxs = useMemo(
    () =>
      uniqBy(
        orderBy(
          applyFilters({
            txs: fetchedConfirmedTxs,
            addressHashes,
            allAddressHashes,
            directions,
            assetIds
          }),
          'timestamp',
          'desc'
        ),
        'hash'
      ).slice(0, (pagesLoaded || 1) * TRANSACTIONS_PAGE_DEFAULT_LIMIT),
    [addressHashes, allAddressHashes, assetIds, directions, fetchedConfirmedTxs, pagesLoaded]
  )

  return (
    <Table minWidth="500px">
      {isLoading && <TableRowsLoader />}

      {showNewTxsMessage && <NewTransactionsButtonRow onClick={refresh} />}

      {filteredConfirmedTxs.map((tx) => (
        <TransactionRow
          key={tx.hash}
          tx={tx}
          onClick={() => openTransactionDetailsModal(tx.hash)}
          onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash))}
        />
      ))}

      {!isLoading && (
        <TransactionsListFooter
          isDisplayingTxs={filteredConfirmedTxs && filteredConfirmedTxs?.length > 0}
          showLoadMoreBtn={hasNextPage}
          showSpinner={isFetchingNextPage}
          onShowMoreClick={fetchNextPage}
          noTxsMsg={t('No transactions to display')}
          allTxsLoadedMsg={t('All the transactions that match the filtering criteria were loaded!')}
        />
      )}
    </Table>
  )
}

export default WalletTransactionsList

const applyFilters = ({
  txs,
  addressHashes,
  allAddressHashes,
  directions,
  assetIds
}: WalletTransactionListProps & {
  txs: e.Transaction[]
  allAddressHashes: AddressHash[]
}) => {
  const isDirectionsFilterEnabled = directions && directions.length > 0
  const isAssetsFilterEnabled = assetIds && assetIds.length > 0
  const isAddressFilterEnabled = addressHashes && addressHashes.length > 0

  return isDirectionsFilterEnabled || isAssetsFilterEnabled || isAddressFilterEnabled
    ? txs.filter((tx) => {
        const txRefAddress = findTransactionReferenceAddress(
          isAddressFilterEnabled ? addressHashes : allAddressHashes,
          tx
        )

        if (!txRefAddress) return false

        const { tokenAmounts } = calcTxAmountsDeltaForAddress(tx, txRefAddress)
        const infoType = getTransactionInfoType(tx, txRefAddress)

        const dir = infoType === 'pending' ? 'out' : infoType
        const tokenIds = [ALPH.id, ...tokenAmounts.map(({ id }) => id)]

        const passedDirectionsFilter = !isDirectionsFilterEnabled || directions.includes(dir)
        const passedAssetsFilter = !isAssetsFilterEnabled || tokenIds.some((id) => assetIds.includes(id))

        return passedDirectionsFilter && passedAssetsFilter
      })
    : txs
}
