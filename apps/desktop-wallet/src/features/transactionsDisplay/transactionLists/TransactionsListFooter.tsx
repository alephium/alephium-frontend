import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import PlaceholderText from '@/components/EmptyPlaceholder'
import Spinner from '@/components/Spinner'
import { TableCellPlaceholder, TableRow } from '@/components/Table'
import { useAppSelector } from '@/hooks/redux'

interface TransactionsListFooterBaseProps {
  isDisplayingTxs: boolean
  showSpinner: boolean
  noTxsMsg: string
}

interface InfiniteTransactionsListFooterProps extends TransactionsListFooterBaseProps {
  showLoadMoreBtn: boolean
  onShowMoreClick: () => void
  allTxsLoadedMsg: string
  latestTxDate?: number
}

interface StaticTransactionsListFooterProps extends TransactionsListFooterBaseProps {
  showLoadMoreBtn: false
  onShowMoreClick?: undefined
  allTxsLoadedMsg?: undefined
  latestTxDate?: undefined
}

const TransactionsListFooter = (props: InfiniteTransactionsListFooterProps | StaticTransactionsListFooterProps) => {
  const { t } = useTranslation()
  const region = useAppSelector((state) => state.settings.region)

  if (isStaticTransactionsList(props) && props.isDisplayingTxs) return null

  return (
    <TableRow role="row" tabIndex={0}>
      <TableCellPlaceholder align="center">
        {!props.isDisplayingTxs && props.showLoadMoreBtn && props.latestTxDate ? (
          <NoTxsBeforeDate>
            <PlaceholderTextStyled emoji="🔎">
              {t('No transactions before {{ date }}', {
                date: dayjs(props.latestTxDate).toDate().toLocaleString(region, { dateStyle: 'medium' })
              })}
            </PlaceholderTextStyled>
            <ActionLink onClick={props.onShowMoreClick}>{t('Show more')}</ActionLink>
          </NoTxsBeforeDate>
        ) : props.isDisplayingTxs ? (
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

const NoTxsBeforeDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px;
`

const PlaceholderTextStyled = styled(PlaceholderText)`
  width: 100%;
`
