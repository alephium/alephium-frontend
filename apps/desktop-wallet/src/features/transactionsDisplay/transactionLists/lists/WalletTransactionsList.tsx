import {
  AddressHash,
  Asset,
  calcTxAmountsDeltaForAddress,
  findTransactionReferenceAddress,
  getTransactionInfoType,
  TRANSACTIONS_PAGE_DEFAULT_LIMIT
} from '@alephium/shared'
import {
  useFetchWalletTransactionsInfinite,
  useIsExplorerOffline,
  useUnsortedAddressesHashes
} from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { orderBy, uniqBy } from 'lodash'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Spinner from '@/components/Spinner'
import Table, { TableCell, TableRow } from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import OfflineMessage from '@/features/offline/OfflineMessage'
import TableRowsLoader from '@/features/transactionsDisplay/transactionLists/TableRowsLoader'
import TransactionsListFooter from '@/features/transactionsDisplay/transactionLists/TransactionsListFooter'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch } from '@/hooks/redux'
import { Direction } from '@/types/transactions'
import { onEnterOrSpace } from '@/utils/misc'
import { directionOptions } from '@/utils/transactions'

interface WalletTransactionListProps {
  addressHashes?: AddressHash[]
  directions?: Direction[]
  assetIds?: Asset['id'][]
}

const WalletTransactionsList = ({ addressHashes, directions, assetIds }: WalletTransactionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const allAddressHashes = useUnsortedAddressesHashes()
  const isExplorerOffline = useIsExplorerOffline()

  const {
    data: fetchedConfirmedTxs,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    pagesLoaded
  } = useFetchWalletTransactionsInfinite()

  const filteredConfirmedTxs = useMemo(() => {
    const txs = uniqBy(
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
    )

    return !hasNextPage ? txs : txs.slice(0, (pagesLoaded || 1) * TRANSACTIONS_PAGE_DEFAULT_LIMIT)
  }, [addressHashes, allAddressHashes, assetIds, directions, fetchedConfirmedTxs, hasNextPage, pagesLoaded])

  const openTransactionDetailsModal = (txHash: e.Transaction['hash']) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash } }))

  return (
    <Table minWidth="500px">
      {isExplorerOffline && <OfflineMessage />}
      {isLoading && <TableRowsLoader />}
      {isFetching && !isLoading && (
        <TableRow role="row">
          <LoadingNewTransactionsPlaceholderRow align="center" role="gridcell">
            <Spinner size="18px" /> {t('Loading new transactions...')}
          </LoadingNewTransactionsPlaceholderRow>
        </TableRow>
      )}
      {filteredConfirmedTxs.map((tx) => (
        <TransactionRow
          key={tx.hash}
          tx={tx}
          onClick={() => openTransactionDetailsModal(tx.hash)}
          onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash))}
          view="wallet"
        />
      ))}

      {!isLoading && (
        <TransactionsListFooter
          isDisplayingTxs={filteredConfirmedTxs && filteredConfirmedTxs?.length > 0}
          showLoadMoreBtn={hasNextPage}
          showSpinner={isFetchingNextPage}
          onShowMoreClick={fetchNextPage}
          noTxsMsg={t('No transactions to display')}
          latestTxDate={fetchedConfirmedTxs && fetchedConfirmedTxs[fetchedConfirmedTxs.length - 1]?.timestamp}
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
  const isDirectionsFilterEnabled = directions && directions.length > 0 && directions.length !== directionOptions.length
  const isAssetsFilterEnabled = assetIds && assetIds.length > 0
  const isAddressFilterEnabled =
    addressHashes && addressHashes.length > 0 && addressHashes.length !== allAddressHashes.length

  return isDirectionsFilterEnabled || isAssetsFilterEnabled || isAddressFilterEnabled
    ? txs.filter((tx) => {
        const txRefAddress = findTransactionReferenceAddress(
          isAddressFilterEnabled ? addressHashes : allAddressHashes,
          tx
        )

        if (!txRefAddress) return false

        const { tokenAmounts } = calcTxAmountsDeltaForAddress(tx, txRefAddress)
        const infoType = getTransactionInfoType(tx, txRefAddress, allAddressHashes)

        const dir = infoType === 'pending' ? 'out' : infoType
        const tokenIds = [ALPH.id, ...tokenAmounts.map(({ id }) => id)]

        const passedDirectionsFilter = !isDirectionsFilterEnabled || directions.includes(dir)
        const passedAssetsFilter = !isAssetsFilterEnabled || tokenIds.some((id) => assetIds.includes(id))

        return passedDirectionsFilter && passedAssetsFilter
      })
    : txs
}

const LoadingNewTransactionsPlaceholderRow = styled(TableCell)`
  gap: 10px;
  align-items: center;
`
