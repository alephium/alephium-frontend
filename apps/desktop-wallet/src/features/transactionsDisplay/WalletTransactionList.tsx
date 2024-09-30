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

import { AddressHash, Asset, findTransactionReferenceAddress } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { colord } from 'colord'
import { uniqBy } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchWalletLastTransaction from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactionHash'
import { walletTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import ActionLink from '@/components/ActionLink'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Table, { TableCell, TableCellPlaceholder, TableRow } from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import {
  getTransactionAmountDeltas,
  getTransactionInfoType
} from '@/features/transactionsDisplay/transactionDisplayUtils'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { makeSelectAddressesPendingTransactions } from '@/storage/transactions/transactionsSelectors'
import { Direction } from '@/types/transactions'
import { onEnterOrSpace } from '@/utils/misc'

interface WalletTransactionListProps {
  addressHashes?: AddressHash[]
  directions?: Direction[]
  assetIds?: Asset['id'][]
}

const WalletTransactionList = ({ addressHashes, directions, assetIds }: WalletTransactionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const allAddressHashes = useAppSelector(selectAllAddressHashes)

  const selectAddressesPendingTransactions = useMemo(makeSelectAddressesPendingTransactions, [])
  const pendingTxs = useAppSelector((s) => selectAddressesPendingTransactions(s, addressHashes)) // TODO

  const { data: detectedTxUpdates, isLoading: isLoadingLatestTx } = useFetchWalletLastTransaction()

  const [fetchedTransactionListAt, setRefreshedTransactionListAt] = useState(0)

  const handleRefresh = () => setRefreshedTransactionListAt(new Date().getTime())

  const {
    data: confirmedTxsPages,
    fetchNextPage,
    isLoading: isLoadingConfirmedTxs,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(
    walletTransactionsInfiniteQuery({
      allAddressHashes,
      timestamp: fetchedTransactionListAt,
      networkId,
      skip: isLoadingLatestTx
    })
  )

  const openTransactionDetailsModal = (txHash: Transaction['hash'], addressHash: AddressHash) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash, addressHash } }))

  const fetchedConfirmedTxs = useMemo(() => confirmedTxsPages?.pages.flat() ?? [], [confirmedTxsPages?.pages])
  const filteredConfirmedTxs = useMemo(
    () =>
      applyFilters({
        txs: fetchedConfirmedTxs,
        addressHashes,
        allAddressHashes,
        directions,
        assetIds
      }),
    [addressHashes, allAddressHashes, assetIds, directions, fetchedConfirmedTxs]
  )
  const latestFetchedTxHash = fetchedConfirmedTxs[0]?.hash
  const latestUnfetchedTxHash = detectedTxUpdates.latestTx?.hash

  return (
    <Table minWidth="500px">
      {isLoadingConfirmedTxs &&
        Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        ))}

      {!isLoadingConfirmedTxs && latestUnfetchedTxHash && latestFetchedTxHash !== latestUnfetchedTxHash && (
        <NewTransactionsRow role="row" onClick={handleRefresh}>
          <TableCell align="center" role="gridcell">
            🆕 {t('Click to display new transactions')}
          </TableCell>
        </NewTransactionsRow>
      )}

      {/* TODO: Remove pending txs from tx list */}
      {pendingTxs.map((tx) => (
        <TransactionRow key={tx.hash} tx={tx} addressHash={tx.address.hash} blinking />
      ))}

      {/* TODO: Remove uniqBy once backend removes duplicates from its results */}
      {uniqBy(filteredConfirmedTxs, 'hash').map((tx) => {
        const basedOnAddress = findTransactionReferenceAddress(allAddressHashes, tx)

        if (!basedOnAddress) return null

        return (
          <TransactionRow
            key={tx.hash}
            tx={tx}
            addressHash={basedOnAddress}
            onClick={() => openTransactionDetailsModal(tx.hash, basedOnAddress)}
            onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash, basedOnAddress))}
          />
        )
      })}

      {!isLoadingConfirmedTxs && filteredConfirmedTxs && filteredConfirmedTxs?.length > 0 && (
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

      {!isLoadingConfirmedTxs &&
        pendingTxs.length === 0 &&
        (!filteredConfirmedTxs || filteredConfirmedTxs.length === 0) && (
          <TableRow role="row" tabIndex={0}>
            <TableCellPlaceholder align="center">{t('No transactions to display')}</TableCellPlaceholder>
          </TableRow>
        )}
    </Table>
  )
}

export default WalletTransactionList

const applyFilters = ({
  txs,
  addressHashes,
  allAddressHashes,
  directions,
  assetIds
}: WalletTransactionListProps & {
  txs: Transaction[]
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

        const { tokenAmounts } = getTransactionAmountDeltas(tx, txRefAddress)
        const infoType = getTransactionInfoType(tx, txRefAddress)

        const dir = infoType === 'pending' ? 'out' : infoType
        const tokenIds = [ALPH.id, ...tokenAmounts.map(({ id }) => id)]

        const passedDirectionsFilter = !isDirectionsFilterEnabled || directions.includes(dir)
        const passedAssetsFilter = !isAssetsFilterEnabled || tokenIds.some((id) => assetIds.includes(id))

        return passedDirectionsFilter && passedAssetsFilter
      })
    : txs
}

const NewTransactionsRow = styled(TableRow)`
  background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.15).toHex()};
`
