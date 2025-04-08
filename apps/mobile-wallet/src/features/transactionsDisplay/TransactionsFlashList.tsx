import { AddressHash, isAddressPresentInInputsOutputs, TRANSACTIONS_PAGE_DEFAULT_LIMIT } from '@alephium/shared'
import { useFetchWalletTransactionsInfinite } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { orderBy, uniqBy } from 'lodash'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenSectionTitle } from '~/components/layout/Screen'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import TransactionListItem from '~/features/transactionsDisplay/TransactionListItem'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface TransactionsFlashListProps extends Partial<FlashListProps<e.Transaction>> {
  forAddressHash?: AddressHash
}

type TransactionItem = {
  item: e.Transaction
  index: number
  isLast?: boolean
}

const TransactionsFlashList = forwardRef(
  (
    { forAddressHash, ListHeaderComponent, style, ...props }: TransactionsFlashListProps,
    ref: ForwardedRef<FlashList<e.Transaction>>
  ) => {
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const {
      data: fetchedConfirmedTxs,
      isLoading,
      isFetching,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      pagesLoaded
    } = useFetchWalletTransactionsInfinite()

    const displayedConfirmedTransactions = useMemo(() => {
      const txs = uniqBy(
        orderBy(
          forAddressHash
            ? fetchedConfirmedTxs.filter((tx) => isAddressPresentInInputsOutputs(forAddressHash, tx))
            : fetchedConfirmedTxs,
          'timestamp',
          'desc'
        ),
        'hash'
      )

      return !hasNextPage ? txs : txs.slice(0, (pagesLoaded || 1) * TRANSACTIONS_PAGE_DEFAULT_LIMIT)
    }, [forAddressHash, fetchedConfirmedTxs, hasNextPage, pagesLoaded])

    const renderConfirmedTransactionItem = ({ item, index }: TransactionItem) =>
      renderTransactionItem({ item, index, isLast: index === displayedConfirmedTransactions.length - 1 })

    const renderTransactionItem = ({ item: tx, isLast }: TransactionItem) => (
      <TransactionListItem
        key={tx.hash}
        tx={tx}
        isLast={isLast}
        refAddressHash={forAddressHash}
        onPress={() => {
          dispatch(openModal({ name: 'TransactionModal', props: { txHash: tx.hash } }))
        }}
      />
    )

    return (
      <FlashList
        {...props}
        ref={ref}
        scrollEventThrottle={16}
        data={displayedConfirmedTransactions}
        renderItem={renderConfirmedTransactionItem}
        keyExtractor={(tx) => tx.hash}
        onEndReached={fetchNextPage}
        refreshControl={<RefreshSpinner />}
        refreshing={isFetching}
        extraData={displayedConfirmedTransactions.length > 0 ? displayedConfirmedTransactions[0].hash : ''}
        estimatedItemSize={64}
        contentContainerStyle={{ paddingHorizontal: DEFAULT_MARGIN }}
        ListEmptyComponent={
          !isLoading && !hasNextPage ? (
            <EmptyPlaceholder>
              <AppText size={32}>🤷‍♂️</AppText>
              <AppText color="secondary">{t('No transactions yet')}</AppText>
            </EmptyPlaceholder>
          ) : null
        }
        ListHeaderComponent={
          <>
            {ListHeaderComponent}
            {/* {pendingTransactions.length > 0 && (
              <>
                <PendingTransactionsSectionTitle>
                  <ScreenSectionTitleStyled>{t('Pending transactions')}</ScreenSectionTitleStyled>
                  <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />
                </PendingTransactionsSectionTitle>
                {pendingTransactions.map((pendingTransaction, index) =>
                  renderTransactionItem({
                    item: pendingTransaction,
                    index,
                    isLast: index === pendingTransactions.length - 1,
                    skipTimestamp: true
                  })
                )}
                <ScreenSectionTitleStyled>{t('Confirmed transactions')}</ScreenSectionTitleStyled>
              </>
            )} */}
          </>
        }
        ListFooterComponent={
          <Footer>
            <InfiniteLoadingIndicator>
              {displayedConfirmedTransactions.length > 0 && !hasNextPage && (
                <AppText color="tertiary" semiBold style={{ maxWidth: '75%', textAlign: 'center' }}>
                  👏 {t('You reached the end of the transactions history.')}
                </AppText>
              )}
              {isFetchingNextPage && <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />}
            </InfiniteLoadingIndicator>
          </Footer>
        }
      />
    )
  }
)

export default TransactionsFlashList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-top: 22px;
`

const Footer = styled.View`
  padding-bottom: 150px;
  align-items: center;
`

const InfiniteLoadingIndicator = styled.View``

const PendingTransactionsSectionTitle = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`

const ActivityIndicatorStyled = styled(ActivityIndicator)`
  margin-left: 5px;
`
