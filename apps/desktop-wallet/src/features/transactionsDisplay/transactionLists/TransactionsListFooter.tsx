import { useTranslation } from 'react-i18next'

import ActionLink from '@/components/ActionLink'
import PlaceholderText from '@/components/EmptyPlaceholder'
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
          <PlaceholderText emoji="🔎">{props.noTxsMsg}</PlaceholderText>
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
