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

import { ActivityIndicator, FlatListProps } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchAddressesData, fetchAddressesTransactionsNextPage } from '../../store/addressesSlice'
import { AddressHash } from '../../types/addresses'
import { AddressConfirmedTransaction, AddressPendingTransaction, AddressTransaction } from '../../types/transactions'
import AppText from '../AppText'
import TransactionRow from '../TransactionRow'
import InWalletFlatList from './InWalletFlatList'
import { ScreenSectionTitle } from './Screen'

interface InWalletTransactionsFlatListProps extends Partial<FlatListProps<AddressTransaction>> {
  confirmedTransactions: AddressConfirmedTransaction[]
  pendingTransactions: AddressPendingTransaction[]
  addressHashes: AddressHash[]
  haveAllPagesLoaded: boolean
  onScrollYChange: (scrollY: number) => void
}

type TransactionItem = {
  item: AddressTransaction
  index: number
  isLast?: boolean
}

const transactionKeyExtractor = (tx: AddressTransaction) => `${tx.hash}-${tx.address.hash}`

const InWalletTransactionsFlatList = ({
  confirmedTransactions,
  pendingTransactions,
  addressHashes,
  haveAllPagesLoaded,
  ListHeaderComponent,
  ...props
}: InWalletTransactionsFlatListProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((state) => state.addresses.loading)

  const renderConfirmedTransactionItem = ({ item, index }: TransactionItem) =>
    renderTransactionItem({ item, index, isLast: index === confirmedTransactions.length - 1 })

  const renderTransactionItem = ({ item: tx, index, isLast }: TransactionItem) => (
    <TransactionRowStyled key={transactionKeyExtractor(tx)} tx={tx} isFirst={index === 0} isLast={isLast} />
  )

  const fetchNextTransactionsPage = () => {
    if (!isLoading && !haveAllPagesLoaded) {
      dispatch(fetchAddressesTransactionsNextPage(addressHashes))
    }
  }

  const refreshData = () => {
    if (!isLoading) dispatch(fetchAddressesData(addressHashes))
  }

  return (
    <InWalletFlatList
      {...props}
      data={confirmedTransactions}
      renderItem={renderConfirmedTransactionItem}
      keyExtractor={transactionKeyExtractor}
      onEndReached={fetchNextTransactionsPage}
      onRefresh={refreshData}
      refreshing={isLoading}
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
            </>
          )}
          <ScreenSectionTitleStyled>Latest transactions</ScreenSectionTitleStyled>
        </>
      }
      ListFooterComponent={
        <Footer>
          {haveAllPagesLoaded && confirmedTransactions.length > 0 && (
            <AppText color={theme.font.tertiary} bold>
              👏 You reached the end of history!
            </AppText>
          )}
          {!haveAllPagesLoaded && isLoading && <ActivityIndicator size="large" color={theme.font.primary} />}
          {confirmedTransactions.length === 0 && !isLoading && (
            <AppText color={theme.font.tertiary} bold>
              No transactions yet!
            </AppText>
          )}
        </Footer>
      }
    />
  )
}

export default InWalletTransactionsFlatList

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
