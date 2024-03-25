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

import { ForwardedRef, forwardRef, useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, FlatListProps } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomModal from '~/components/layout/BottomModal'
import RefreshSpinner from '~/components/RefreshSpinner'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import TransactionModal from '~/screens/TransactionModal'
import { syncAllAddressesTransactionsNextPage } from '~/store/addressesSlice'
import { DEFAULT_MARGIN, SCREEN_OVERFLOW } from '~/style/globalStyle'
import { AddressConfirmedTransaction, AddressPendingTransaction, AddressTransaction } from '~/types/transactions'
import { isPendingTx } from '~/utils/transactions'

import TransactionListItem from '../TransactionListItem'
import { ScreenSectionTitle } from './Screen'

interface TransactionsFlatListProps extends Partial<FlatListProps<AddressTransaction>> {
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

const TransactionsFlatList = forwardRef(function TransactionsFlatList(
  {
    confirmedTransactions,
    pendingTransactions,
    ListHeaderComponent,
    showInternalInflows = false,
    style,
    ...props
  }: TransactionsFlatListProps,
  ref: ForwardedRef<FlatList<AddressTransaction>>
) {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const isLoading = useAppSelector((s) => s.loaders.loadingTransactionsNextPage)
  const allConfirmedTransactionsLoaded = useAppSelector((s) => s.confirmedTransactions.allLoaded)

  const [txModalOpen, setTxModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<AddressConfirmedTransaction>()

  const renderConfirmedTransactionItem = ({ item, index }: TransactionItem) =>
    renderTransactionItem({ item, index, isLast: index === confirmedTransactions.length - 1 })

  const renderTransactionItem = ({ item: tx, isLast }: TransactionItem) => (
    <TransactionListItemStyled
      key={transactionKeyExtractor(tx)}
      tx={tx}
      isLast={isLast}
      onPress={() => {
        if (!isPendingTx(tx)) {
          setSelectedTx(tx)
          setTxModalOpen(true)
        }
      }}
    />
  )

  const loadNextTransactionsPage = useCallback(async () => {
    if (isLoading || allConfirmedTransactionsLoaded) return

    dispatch(syncAllAddressesTransactionsNextPage({ minTxs: 10 }))
  }, [allConfirmedTransactionsLoaded, dispatch, isLoading])

  return (
    <>
      <FlatList
        {...props}
        contentContainerStyle={props.contentContainerStyle}
        scrollEventThrottle={16}
        ref={ref}
        data={confirmedTransactions}
        renderItem={renderConfirmedTransactionItem}
        keyExtractor={transactionKeyExtractor}
        onEndReached={loadNextTransactionsPage}
        style={{ overflow: SCREEN_OVERFLOW }}
        refreshControl={<RefreshSpinner />}
        refreshing={pendingTransactions.length > 0}
        extraData={confirmedTransactions.length > 0 ? confirmedTransactions[0].hash : ''}
        ListHeaderComponent={
          <>
            {ListHeaderComponent}
            {pendingTransactions.length > 0 && (
              <>
                <PendingTransactionsSectionTitle>
                  <ScreenSectionTitleStyled>Pending transactions</ScreenSectionTitleStyled>
                  <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />
                </PendingTransactionsSectionTitle>
                {pendingTransactions.map((pendingTransaction, index) =>
                  renderTransactionItem({
                    item: pendingTransaction,
                    index,
                    isLast: index === pendingTransactions.length - 1
                  })
                )}
                <ScreenSectionTitleStyled>Confirmed transactions</ScreenSectionTitleStyled>
              </>
            )}
          </>
        }
        ListFooterComponent={
          <Footer>
            <InfiniteLoadingIndicator>
              {allConfirmedTransactionsLoaded && confirmedTransactions.length > 0 && (
                <AppText color="tertiary" semiBold style={{ maxWidth: '75%', textAlign: 'center' }}>
                  👏 You reached the end of the transactions&apos; history.
                </AppText>
              )}
              {isLoading && !allConfirmedTransactionsLoaded && (
                <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />
              )}
            </InfiniteLoadingIndicator>
            {confirmedTransactions.length === 0 && !isLoading && (
              <EmptyPlaceholder style={{ width: '90%' }}>
                <AppText color="secondary" semiBold>
                  No transactions yet 🤷‍♂️
                </AppText>
              </EmptyPlaceholder>
            )}
          </Footer>
        }
      />

      <Portal>
        <BottomModal
          Content={(props) => selectedTx && <TransactionModal {...props} tx={selectedTx} />}
          isOpen={txModalOpen}
          onClose={() => setTxModalOpen(false)}
        />
      </Portal>
    </>
  )
})

export default TransactionsFlatList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: ${DEFAULT_MARGIN}px;
  margin-top: 22px;
`

const TransactionListItemStyled = styled(TransactionListItem)``

const Footer = styled.View`
  padding-bottom: 150px;
  align-items: center;
`

const InfiniteLoadingIndicator = styled.View`
  margin-top: 25px;
`

const PendingTransactionsSectionTitle = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`

const ActivityIndicatorStyled = styled(ActivityIndicator)`
  margin-left: 5px;
`
