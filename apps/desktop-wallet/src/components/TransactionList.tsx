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

import {
  AddressConfirmedTransaction,
  AddressHash,
  Asset,
  useAddressesConfirmedTransactions,
  useAddressesPendingTransactions
} from '@alephium/shared'
import { ChevronRight } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useAddressesWithSomeBalance } from '@/api/apiHooks'
import ActionLink from '@/components/ActionLink'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Table, { TableCell, TableCellPlaceholder, TableHeader, TableRow } from '@/components/Table'
import TransactionalInfo from '@/components/TransactionalInfo'
import ModalPortal from '@/modals/ModalPortal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import { Direction } from '@/types/transactions'
import { useTransactionsInfo } from '@/utils/transactions'

interface TransactionListProps {
  addressHashes?: AddressHash[]
  className?: string
  title?: string
  limit?: number
  compact?: boolean
  hideHeader?: boolean
  hideFromColumn?: boolean
  directions?: Direction[]
  assetIds?: Asset['id'][]
  headerExtraContent?: ReactNode
}

const TransactionList = ({
  className,
  addressHashes,
  title,
  limit,
  compact,
  hideHeader = false,
  hideFromColumn = false,
  directions,
  assetIds,
  headerExtraContent
}: TransactionListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: addresses } = useAddressesWithSomeBalance()
  const usedAddressHashes = addressHashes ?? addresses.map((a) => a.hash)

  const {
    txs: confirmedTxs = [],
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useAddressesConfirmedTransactions(usedAddressHashes)
  const pendingTxsPerAddress = useAddressesPendingTransactions(usedAddressHashes)
  const pendingTxs = pendingTxsPerAddress.flat()

  const [selectedTransaction, setSelectedTransaction] = useState<AddressConfirmedTransaction>()

  const filteredConfirmedTxs = useFilters({ txs: confirmedTxs, directions, assetIds, hideFromColumn })
  const displayedConfirmedTxs = limit ? filteredConfirmedTxs.slice(0, limit - pendingTxs.length) : filteredConfirmedTxs

  return (
    <>
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
        {isLoading && (
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
          <TableRow key={tx.hash} blinking role="row" tabIndex={0}>
            <TransactionalInfo
              transaction={tx}
              addressHash={tx.internalAddressHash}
              showInternalInflows={hideFromColumn}
              compact={compact}
            />
          </TableRow>
        ))}
        {displayedConfirmedTxs.map((tx) => (
          <TableRow
            key={tx.hash}
            role="row"
            tabIndex={0}
            onClick={() => setSelectedTransaction(tx)}
            onKeyPress={() => setSelectedTransaction(tx)}
          >
            <TransactionalInfo
              transaction={tx}
              addressHash={tx.internalAddressHashes.inputAddresses[0] || tx.internalAddressHashes.outputAddresses[0]}
              showInternalInflows={hideFromColumn}
              compact={compact}
            />
          </TableRow>
        ))}
        {limit === undefined && (
          <TableRow role="row">
            <TableCell align="center" role="gridcell">
              {!hasNextPage ? (
                <span>{t('All transactions loaded!')}</span>
              ) : isLoading ? (
                <Spinner size="15px" />
              ) : (
                <ActionLink onClick={fetchNextPage}>{t('Show more')}</ActionLink>
              )}
            </TableCell>
          </TableRow>
        )}
        {!isLoading && !pendingTxs.length && !displayedConfirmedTxs.length && (
          <TableRow role="row" tabIndex={0}>
            <TableCellPlaceholder align="center">{t('No transactions to display')}</TableCellPlaceholder>
          </TableRow>
        )}
      </Table>
      <ModalPortal>
        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(undefined)}
          />
        )}
      </ModalPortal>
    </>
  )
}

export default TransactionList

const useFilters = ({
  txs,
  hideFromColumn,
  directions,
  assetIds
}: Pick<TransactionListProps, 'directions' | 'assetIds' | 'hideFromColumn'> & {
  txs: AddressConfirmedTransaction[]
}) => {
  const isDirectionsFilterEnabled = directions && directions.length > 0
  const isAssetsFilterEnabled = assetIds && assetIds.length > 0

  const txsInfo = useTransactionsInfo(txs, hideFromColumn)

  return isDirectionsFilterEnabled || isAssetsFilterEnabled
    ? txs.filter((tx, i) => {
        const { assets, infoType } = txsInfo[i]
        const dir = infoType === 'pending' ? 'out' : infoType

        const passedDirectionsFilter = !isDirectionsFilterEnabled || directions.includes(dir)
        const passedAssetsFilter = !isAssetsFilterEnabled || assets.some((asset) => assetIds.includes(asset.id))

        return passedDirectionsFilter && passedAssetsFilter
      })
    : txs
}

const ActionLinkStyled = styled(ActionLink)`
  margin-left: 20px;
`
