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

import { AddressHash, Asset } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { ChevronRight } from 'lucide-react'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Table, { TableCell, TableCellPlaceholder, TableHeader, TableRow } from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import {
  getTransactionAmountDeltas,
  getTransactionInfoType
} from '@/features/transactionsDisplay/transactionDisplayUtils'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import {
  makeSelectAddresses,
  selectHaveAllPagesLoaded,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import {
  makeSelectAddressesConfirmedTransactions,
  makeSelectAddressesPendingTransactions
} from '@/storage/transactions/transactionsSelectors'
import { AddressConfirmedTransaction, Direction } from '@/types/transactions'
import { onEnterOrSpace } from '@/utils/misc'

interface TransactionListProps {
  addressHashes?: AddressHash[]
  className?: string
  title?: string
  limit?: number
  compact?: boolean
  hideHeader?: boolean
  isInAddressDetailsModal?: boolean
  directions?: Direction[]
  assetIds?: Asset['id'][]
  headerExtraContent?: ReactNode
}

const maxAttemptsToFindNewTxs = 10

const TransactionList = ({
  className,
  addressHashes,
  title,
  limit,
  compact,
  hideHeader = false,
  isInAddressDetailsModal = false,
  directions,
  assetIds,
  headerExtraContent
}: TransactionListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const selectAddresses = useMemo(makeSelectAddresses, [])
  const addresses = useAppSelector((s) => selectAddresses(s, addressHashes))
  const selectAddressesConfirmedTransactions = useMemo(makeSelectAddressesConfirmedTransactions, [])
  const selectAddressesPendingTransactions = useMemo(makeSelectAddressesPendingTransactions, [])
  const confirmedTxs = useAppSelector((s) => selectAddressesConfirmedTransactions(s, addressHashes))
  const pendingTxs = useAppSelector((s) => selectAddressesPendingTransactions(s, addressHashes))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const finishedLoadingData = useAppSelector((s) => !s.addresses.loadingTransactions)
  const allAddressTxPagesLoaded = useAppSelector(selectHaveAllPagesLoaded)

  const [attemptToFindNewFilteredTxs, setAttemptToFindNewFilteredTxs] = useState(0)

  const singleAddress = addresses.length === 1
  const filteredConfirmedTxs = applyFilters({ txs: confirmedTxs, directions, assetIds, isInAddressDetailsModal })
  const displayedConfirmedTxs = limit ? filteredConfirmedTxs.slice(0, limit - pendingTxs.length) : filteredConfirmedTxs
  const userAttemptedToLoadMoreTxs =
    attemptToFindNewFilteredTxs > 0 && attemptToFindNewFilteredTxs <= maxAttemptsToFindNewTxs
  const allTxsLoaded = singleAddress ? addresses[0].allTransactionPagesLoaded : allAddressTxPagesLoaded

  const nbOfDisplayedTxs = useRef(filteredConfirmedTxs.length)
  const areNewTransactionsDisplayed = nbOfDisplayedTxs.current < filteredConfirmedTxs.length
  const shouldContinueFetchingTxs = finishedLoadingData && nbOfDisplayedTxs.current === filteredConfirmedTxs.length

  const handleShowMoreClick = () => {
    setAttemptToFindNewFilteredTxs(1)
    loadNextTransactionsPage()
  }

  const loadNextTransactionsPage = useCallback(
    async () =>
      singleAddress
        ? dispatch(syncAddressTransactionsNextPage(addresses[0].hash))
        : dispatch(syncAllAddressesTransactionsNextPage({ minTxs: 10 })),
    [addresses, dispatch, singleAddress]
  )

  const openTransactionDetailsModal = (txHash: Transaction['hash'], addressHash: AddressHash) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash, addressHash } }))

  useEffect(() => {
    if (!stateUninitialized) {
      nbOfDisplayedTxs.current = filteredConfirmedTxs.length
    }
  }, [filteredConfirmedTxs.length, stateUninitialized])

  useEffect(() => {
    if (!allTxsLoaded && userAttemptedToLoadMoreTxs) {
      if (areNewTransactionsDisplayed) {
        nbOfDisplayedTxs.current = filteredConfirmedTxs.length
        setAttemptToFindNewFilteredTxs(0)
      } else if (shouldContinueFetchingTxs) {
        setAttemptToFindNewFilteredTxs(attemptToFindNewFilteredTxs + 1)
        loadNextTransactionsPage()
      }
    } else {
      setAttemptToFindNewFilteredTxs(0)
    }
  }, [
    allTxsLoaded,
    attemptToFindNewFilteredTxs,
    filteredConfirmedTxs.length,
    userAttemptedToLoadMoreTxs,
    loadNextTransactionsPage,
    shouldContinueFetchingTxs,
    areNewTransactionsDisplayed
  ])

  return (
    <Table className={className} minWidth="500px">
      {!hideHeader && (
        <TableHeader title={title ?? t('Transactions')}>
          {headerExtraContent}
          {limit !== undefined && (
            <ActionLinkStyled onClick={() => navigate('/wallet/transfers')} Icon={ChevronRight} withBackground>
              {t('See more')}
            </ActionLinkStyled>
          )}
        </TableHeader>
      )}
      {stateUninitialized && (
        <>
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        </>
      )}
      {pendingTxs.map((tx) => (
        <TransactionRow
          key={tx.hash}
          tx={tx}
          addressHash={tx.address.hash}
          isInAddressDetailsModal={isInAddressDetailsModal}
          compact={compact}
        />
      ))}
      {displayedConfirmedTxs.map((tx) => (
        <TransactionRow
          key={`${tx.hash}-${tx.address.hash}`}
          tx={tx}
          addressHash={tx.address.hash}
          isInAddressDetailsModal={isInAddressDetailsModal}
          compact={compact}
          onClick={() => openTransactionDetailsModal(tx.hash, tx.address.hash)}
          onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash, tx.address.hash))}
        />
      ))}
      {limit === undefined && (
        <TableRow role="row">
          <TableCell align="center" role="gridcell">
            {allTxsLoaded ? (
              <span>{t('All transactions loaded!')}</span>
            ) : userAttemptedToLoadMoreTxs ? (
              <Spinner size="15px" />
            ) : (
              <ActionLink onClick={handleShowMoreClick}>{t('Show more')}</ActionLink>
            )}
          </TableCell>
        </TableRow>
      )}
      {!stateUninitialized && !pendingTxs.length && !displayedConfirmedTxs.length && (
        <TableRow role="row" tabIndex={0}>
          <TableCellPlaceholder align="center">{t('No transactions to display')}</TableCellPlaceholder>
        </TableRow>
      )}
    </Table>
  )
}

export default TransactionList

const applyFilters = ({
  txs,
  isInAddressDetailsModal,
  directions,
  assetIds
}: Pick<TransactionListProps, 'directions' | 'assetIds' | 'isInAddressDetailsModal'> & {
  txs: AddressConfirmedTransaction[]
}) => {
  const isDirectionsFilterEnabled = directions && directions.length > 0
  const isAssetsFilterEnabled = assetIds && assetIds.length > 0

  return isDirectionsFilterEnabled || isAssetsFilterEnabled
    ? txs.filter((tx) => {
        const { tokenAmounts } = getTransactionAmountDeltas(tx, tx.address.hash)
        const tokenIds = [ALPH.id, ...tokenAmounts.map(({ id }) => id)]
        const infoType = getTransactionInfoType(tx, tx.address.hash, isInAddressDetailsModal)
        const dir = infoType === 'pending' ? 'out' : infoType

        const passedDirectionsFilter = !isDirectionsFilterEnabled || directions.includes(dir)
        const passedAssetsFilter = !isAssetsFilterEnabled || tokenIds.some((id) => assetIds.includes(id))

        return passedDirectionsFilter && passedAssetsFilter
      })
    : txs
}

const ActionLinkStyled = styled(ActionLink)`
  margin-left: 20px;
`