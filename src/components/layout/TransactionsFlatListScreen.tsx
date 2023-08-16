/*
Copyright 2018 - 2022 The Alephium Authors
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

import { useCallback } from 'react'
import { ActivityIndicator, FlatListProps } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import {
  selectAddressByHash,
  syncAddressesData,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'
import { AddressConfirmedTransaction, AddressPendingTransaction, AddressTransaction } from '~/types/transactions'

import TransactionRow from '../TransactionRow'
import { ScreenSectionTitle } from './Screen'
import ScrollFlatListScreen from './ScrollFlatListScreen'

interface TransactionsFlatListScreenProps extends Partial<FlatListProps<AddressTransaction>> {
  confirmedTransactions: AddressConfirmedTransaction[]
  pendingTransactions: AddressPendingTransaction[]
  addressHash?: AddressHash
  showInternalInflows?: boolean
}

type TransactionItem = {
  item: AddressTransaction
  index: number
  isLast?: boolean
}

const transactionKeyExtractor = (tx: AddressTransaction) => `${tx.hash}-${tx.address.hash}`

const TransactionsFlatListScreen = ({
  confirmedTransactions,
  pendingTransactions,
  addressHash,
  ListHeaderComponent,
  showInternalInflows = false,
  ...props
}: TransactionsFlatListScreenProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((s) => s.addresses.loadingTransactions)
  const allConfirmedTransactionsLoaded = useAppSelector((s) => s.confirmedTransactions.allLoaded)
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash ?? ''))

  const renderConfirmedTransactionItem = ({ item, index }: TransactionItem) =>
    renderTransactionItem({ item, index, isLast: index === confirmedTransactions.length - 1 })

  const renderTransactionItem = ({ item: tx, isLast }: TransactionItem) => (
    <TransactionRowStyled key={transactionKeyExtractor(tx)} tx={tx} isLast={isLast} />
  )

  const loadNextTransactionsPage = useCallback(async () => {
    if (isLoading) return

    if (address) {
      if (!address.allTransactionPagesLoaded) {
        dispatch(syncAddressTransactionsNextPage(address.hash))
      }
    } else if (!allConfirmedTransactionsLoaded) {
      dispatch(syncAllAddressesTransactionsNextPage())
    }
  }, [address, allConfirmedTransactionsLoaded, dispatch, isLoading])

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHash))
  }

  return (
    <ScrollFlatListScreen
      {...props}
      data={confirmedTransactions}
      renderItem={renderConfirmedTransactionItem}
      keyExtractor={transactionKeyExtractor}
      onEndReached={loadNextTransactionsPage}
      onRefresh={refreshData}
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
          {((address && address.allTransactionPagesLoaded) || (!address && allConfirmedTransactionsLoaded)) &&
            confirmedTransactions.length > 0 && (
              <AppText color="tertiary" bold>
                👏 You reached the end of history.
              </AppText>
            )}
          {isLoading &&
            ((address && !address.allTransactionPagesLoaded) || (!address && !allConfirmedTransactionsLoaded)) && (
              <ActivityIndicatorStyled size={16} color={theme.font.tertiary} />
            )}
          {confirmedTransactions.length === 0 && !isLoading && (
            <AppText color="tertiary" bold>
              No transactions yet
            </AppText>
          )}
        </Footer>
      }
    />
  )
}

export default TransactionsFlatListScreen

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: 28px;
  margin-top: 22px;
`

const TransactionRowStyled = styled(TransactionRow)`
  margin: 0 20px;
`

const Footer = styled.View`
  padding-top: 40px;
  padding-bottom: 150px;
  align-items: center;
`

const PendingTransactionsSectionTitle = styled.View`
  flex-direction: row;
`

const ActivityIndicatorStyled = styled(ActivityIndicator)`
  margin-left: 5px;
`
