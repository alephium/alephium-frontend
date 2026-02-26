import {
  AddressHash,
  isAddressPresentInInputsOutputs,
  selectAllPendingSentTransactions,
  selectAllSentTransactions,
  TRANSACTIONS_PAGE_DEFAULT_LIMIT
} from '@alephium/shared'
import { useFetchWalletTransactionsInfinite, useIsExplorerOffline } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list'
import { orderBy, uniqBy } from 'lodash'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import OfflineMessage from '~/features/offline/OfflineMessage'
import ConfirmedTransactionListItem from '~/features/transactionsDisplay/ConfirmedTransactionListItem'
import SentTransactionListItem from '~/features/transactionsDisplay/SentTransactionListItem'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface WalletTransactionsFlashListProps extends Partial<FlashListProps<e.Transaction>> {
  forContactAddress?: AddressHash
}

const WalletTransactionsFlashList = forwardRef(
  (
    { forContactAddress, ListHeaderComponent, ...props }: WalletTransactionsFlashListProps,
    ref: ForwardedRef<FlashListRef<e.Transaction>>
  ) => {
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const sentTransactions = useAppSelector(selectAllSentTransactions)
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

    const displayedConfirmedTransactions = useMemo(() => {
      const txs = uniqBy(
        orderBy(
          forContactAddress
            ? fetchedConfirmedTxs.filter((tx) => isAddressPresentInInputsOutputs(forContactAddress, tx))
            : fetchedConfirmedTxs,
          'timestamp',
          'desc'
        ),
        'hash'
      )

      return !hasNextPage ? txs : txs.slice(0, (pagesLoaded || 1) * TRANSACTIONS_PAGE_DEFAULT_LIMIT)
    }, [forContactAddress, fetchedConfirmedTxs, hasNextPage, pagesLoaded])

    const displayedSentTransactions = useMemo(
      () =>
        !forContactAddress
          ? sentTransactions.filter((tx) => !displayedConfirmedTransactions.some((t) => t.hash === tx.hash))
          : [],
      [displayedConfirmedTransactions, sentTransactions, forContactAddress]
    )

    const openTransactionModal = (txHash: string) =>
      dispatch(openModal({ name: 'TransactionModal', props: { txHash } }))

    return (
      <FlashList
        {...props}
        ref={ref}
        scrollEventThrottle={16}
        data={displayedConfirmedTransactions}
        renderItem={({ item: tx, index }) => (
          <ConfirmedTransactionListItem
            key={tx.hash}
            tx={tx}
            isLast={index === displayedConfirmedTransactions.length - 1}
            onPress={() => openTransactionModal(tx.hash)}
          />
        )}
        keyExtractor={(tx) => tx.hash}
        onEndReached={fetchNextPage}
        refreshControl={<RefreshSpinner />}
        refreshing={isFetching}
        extraData={displayedConfirmedTransactions.length > 0 ? displayedConfirmedTransactions[0].hash : ''}
        contentContainerStyle={{ paddingHorizontal: DEFAULT_MARGIN }}
        ListEmptyComponent={
          <EmptyConfirmedTransactionsListPlaceholder isLoading={isLoading} hasNextPage={hasNextPage} />
        }
        ListHeaderComponent={
          <>
            {ListHeaderComponent}
            {isExplorerOffline && <OfflineMessage />}
            {!forContactAddress &&
              displayedSentTransactions.map((tx) => (
                <SentTransactionListItem key={tx.hash} txHash={tx.hash} onPress={() => openTransactionModal(tx.hash)} />
              ))}
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

export default WalletTransactionsFlashList

const EmptyConfirmedTransactionsListPlaceholder = ({
  isLoading,
  hasNextPage
}: {
  isLoading: boolean
  hasNextPage: boolean
}) => {
  const { t } = useTranslation()
  const pendingSentTransactions = useAppSelector(selectAllPendingSentTransactions)

  if (pendingSentTransactions.length > 0) return null

  if (isLoading)
    return (
      <EmptyPlaceholder>
        <AppText size={32}>👀</AppText>
        <AppText color="secondary">{t('Loading transactions...')}</AppText>
      </EmptyPlaceholder>
    )

  if (!hasNextPage)
    return (
      <EmptyPlaceholder>
        <AppText size={32}>🤷‍♂️</AppText>
        <AppText color="secondary">{t('No transactions yet')}</AppText>
      </EmptyPlaceholder>
    )

  return null
}

const Footer = styled.View`
  padding-bottom: 150px;
  align-items: center;
`

const InfiniteLoadingIndicator = styled.View``

const ActivityIndicatorStyled = styled(ActivityIndicator)`
  margin-left: 5px;
`
