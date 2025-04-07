import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import PlaceholderText from '@/components/EmptyPlaceholder'
import Spinner from '@/components/Spinner'
import { TableCellPlaceholder, TableRow } from '@/components/Table'
import { useAppSelector } from '@/hooks/redux'

interface InfiniteTransactionsListFooterProps {
  isDisplayingTxs: boolean
  showSpinner: boolean
  noTxsMsg: string
  showLoadMoreBtn: boolean
  onShowMoreClick: () => void
  allTxsLoadedMsg: string
  latestTxDate?: number
}

const TransactionsListFooter = ({
  isDisplayingTxs,
  showLoadMoreBtn,
  latestTxDate,
  onShowMoreClick,
  showSpinner,
  allTxsLoadedMsg,
  noTxsMsg
}: InfiniteTransactionsListFooterProps) => {
  const { t } = useTranslation()
  const region = useAppSelector((state) => state.settings.region)

  return (
    <TableRow role="row" tabIndex={0}>
      <TableCellPlaceholder align="center">
        {!isDisplayingTxs && showLoadMoreBtn && latestTxDate ? (
          <NoTxsBeforeDate>
            <PlaceholderTextStyled emoji="🔎">
              {t('No transactions before {{ date }}', {
                date: dayjs(latestTxDate).toDate().toLocaleString(region, { dateStyle: 'medium' })
              })}
            </PlaceholderTextStyled>
            <ActionLink onClick={onShowMoreClick}>{t('Show more')}</ActionLink>
          </NoTxsBeforeDate>
        ) : isDisplayingTxs ? (
          showSpinner ? (
            <Spinner size="15px" />
          ) : showLoadMoreBtn ? (
            <ActionLink onClick={onShowMoreClick}>{t('Show more')}</ActionLink>
          ) : (
            allTxsLoadedMsg && <span>{allTxsLoadedMsg}</span>
          )
        ) : (
          <PlaceholderText emoji="🔎">{noTxsMsg}</PlaceholderText>
        )}
      </TableCellPlaceholder>
    </TableRow>
  )
}

export default TransactionsListFooter

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
