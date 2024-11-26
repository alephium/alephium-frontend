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

import { useTranslation } from 'react-i18next'

import ActionLink from '@/components/ActionLink'
import Spinner from '@/components/Spinner'
import { TableCellPlaceholder, TableRow } from '@/components/Table'

interface TransactionsListFooterBaseProps {
  isDisplayingTxs: boolean
  showSpinner: boolean
  noTxsMsg: string
}

interface InfiniteTransactionsListFooterProps extends TransactionsListFooterBaseProps {
  showLoadMoreBtn: boolean
  onShowMoreClick: () => void
  allTxsLoadedMsg: string
}

interface StaticTransactionsListFooterProps extends TransactionsListFooterBaseProps {
  showLoadMoreBtn: false
  onShowMoreClick?: undefined
  allTxsLoadedMsg?: undefined
}

const TransactionsListFooter = (props: InfiniteTransactionsListFooterProps | StaticTransactionsListFooterProps) => {
  const { t } = useTranslation()

  if (isStaticTransactionsList(props) && props.isDisplayingTxs) return null

  return (
    <TableRow role="row" tabIndex={0}>
      <TableCellPlaceholder align="center">
        {props.isDisplayingTxs ? (
          props.showSpinner ? (
            <Spinner size="15px" />
          ) : props.showLoadMoreBtn ? (
            <ActionLink onClick={props.onShowMoreClick}>{t('Show more')}</ActionLink>
          ) : (
            props.allTxsLoadedMsg && <span>{props.allTxsLoadedMsg}</span>
          )
        ) : (
          props.noTxsMsg
        )}
      </TableCellPlaceholder>
    </TableRow>
  )
}

export default TransactionsListFooter

const isStaticTransactionsList = (
  txList: InfiniteTransactionsListFooterProps | StaticTransactionsListFooterProps
): txList is StaticTransactionsListFooterProps =>
  (txList as StaticTransactionsListFooterProps).onShowMoreClick === undefined
