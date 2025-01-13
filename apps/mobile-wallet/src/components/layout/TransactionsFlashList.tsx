import { TRANSACTIONS_PAGE_DEFAULT_LIMIT } from '@alephium/shared'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { ForwardedRef, forwardRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { syncAllAddressesTransactionsNextPage } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { AddressConfirmedTransaction, AddressPendingTransaction, AddressTransaction } from '~/types/transactions'
import { isPendingTx } from '~/utils/transactions'

import TransactionListItem from '../TransactionListItem'
import { ScreenSectionTitle } from './Screen'

interface TransactionsFlashListProps extends Partial<FlashListProps<AddressTransaction>> {
  confirmedTransactions: AddressConfirmedTransaction[]
  pendingTransactions: AddressPendingTransaction[]
  showInternalInflows?: boolean
}

type TransactionItem = {
  item: AddressTransaction
  index: number
  isLast?: boolean
}

const transactionKeyExtractor = (tx: AddressTransaction) => `${tx.hash}-${tx.address.hash}`

const TransactionsFlashList = forwardRef(
  (
    {
      confirmedTransactions,
      pendingTransactions,
      ListHeaderComponent,
      showInternalInflows = false,
      style,
      ...props
    }: TransactionsFlashListProps,
    ref: ForwardedRef<FlashList<AddressTransaction>>
  ) => {
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const isLoading = useAppSelector((s) => s.loaders.loadingTransactionsNextPage)
    const allConfirmedTransactionsLoaded = useAppSelector((s) => s.confirmedTransactions.allLoaded)
    const pageLoaded = useAppSelector((s) => s.confirmedTransactions.pageLoaded)
    const displayedConfirmedTransactions = useMemo(
      () =>
        allConfirmedTransactionsLoaded
          ? confirmedTransactions
          : confirmedTransactions.slice(0, pageLoaded * TRANSACTIONS_PAGE_DEFAULT_LIMIT),
      [confirmedTransactions, pageLoaded, allConfirmedTransactionsLoaded]
    )

    const renderConfirmedTransactionItem = ({ item, index }: TransactionItem) =>
      renderTransactionItem({ item, index, isLast: index === displayedConfirmedTransactions.length - 1 })

    const renderTransactionItem = ({ item: tx, isLast }: TransactionItem) => (
      <TransactionListItem
        key={transactionKeyExtractor(tx)}
        tx={tx}
        isLast={isLast}
        onPress={() => {
          if (!isPendingTx(tx)) {
            dispatch(openModal({ name: 'TransactionModal', props: { tx } }))
          }
        }}
      />
    )

    const loadNextTransactionsPage = useCallback(async () => {
      if (isLoading || allConfirmedTransactionsLoaded) return

      dispatch(syncAllAddressesTransactionsNextPage({ minTxs: 10 }))
    }, [allConfirmedTransactionsLoaded, dispatch, isLoading])

    return (
      <FlashList
        {...props}
        ref={ref}
        scrollEventThrottle={16}
        data={displayedConfirmedTransactions}
        renderItem={renderConfirmedTransactionItem}
        keyExtractor={transactionKeyExtractor}
        onEndReached={loadNextTransactionsPage}
        refreshControl={<RefreshSpinner />}
        refreshing={pendingTransactions.length > 0 || isLoading}
        extraData={displayedConfirmedTransactions.length > 0 ? displayedConfirmedTransactions[0].hash : ''}
        estimatedItemSize={64}
        contentContainerStyle={{ paddingHorizontal: DEFAULT_MARGIN }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyPlaceholder>
              <AppText size={28}>🤷‍♂️</AppText>
              <AppText color="secondary">{t('No transactions yet')}</AppText>
            </EmptyPlaceholder>
          ) : null
        }
        ListHeaderComponent={
          <>
            {ListHeaderComponent}
            {pendingTransactions.length > 0 && (
              <>
                <PendingTransactionsSectionTitle>
                  <ScreenSectionTitleStyled>{t('Pending transactions')}</ScreenSectionTitleStyled>
                  <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />
                </PendingTransactionsSectionTitle>
                {pendingTransactions.map((pendingTransaction, index) =>
                  renderTransactionItem({
                    item: pendingTransaction,
                    index,
                    isLast: index === pendingTransactions.length - 1
                  })
                )}
                <ScreenSectionTitleStyled>{t('Confirmed transactions')}</ScreenSectionTitleStyled>
              </>
            )}
          </>
        }
        ListFooterComponent={
          <Footer>
            <InfiniteLoadingIndicator>
              {allConfirmedTransactionsLoaded && displayedConfirmedTransactions.length > 0 && (
                <AppText color="tertiary" semiBold style={{ maxWidth: '75%', textAlign: 'center' }}>
                  👏 {t('You reached the end of the transactions history.')}
                </AppText>
              )}
              {isLoading && !allConfirmedTransactionsLoaded && (
                <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />
              )}
            </InfiniteLoadingIndicator>
          </Footer>
        }
      />
    )
  }
)

export default TransactionsFlashList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: ${DEFAULT_MARGIN}px;
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
